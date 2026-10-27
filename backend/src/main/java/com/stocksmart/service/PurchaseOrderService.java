package com.stocksmart.service;

import com.stocksmart.dto.order.*;
import com.stocksmart.entity.*;
import com.stocksmart.exception.*;
import com.stocksmart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final LocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;

    private static final List<String> VALID_TRANSITIONS = List.of(
            "DRAFT->ORDERED", "ORDERED->PARTIALLY_RECEIVED", "ORDERED->RECEIVED",
            "PARTIALLY_RECEIVED->RECEIVED", "DRAFT->CANCELLED", "ORDERED->CANCELLED"
    );

    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> getAll(String status, Pageable pageable) {
        return purchaseOrderRepository.findByStatusFilter(status, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public PurchaseOrderResponse create(PurchaseOrderRequest req) {
        Supplier supplier = supplierRepository.findById(req.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", req.supplierId()));
        Location location = locationRepository.findById(req.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", req.locationId()));

        String orderNumber = generateOrderNumber();
        PurchaseOrder po = PurchaseOrder.builder()
                .orderNumber(orderNumber).supplier(supplier).location(location)
                .status("DRAFT").orderDate(req.orderDate()).expectedDate(req.expectedDate())
                .notes(req.notes()).createdBy(getCurrentUser())
                .items(new ArrayList<>()).build();

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseOrderItemRequest item : req.items()) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", item.productId()));
            BigDecimal lineTotal = item.unitCost().multiply(BigDecimal.valueOf(item.quantity()));
            total = total.add(lineTotal);
            po.getItems().add(PurchaseOrderItem.builder()
                    .purchaseOrder(po).product(product)
                    .quantityOrdered(item.quantity()).quantityReceived(0)
                    .unitCost(item.unitCost()).lineTotal(lineTotal).build());
        }
        po.setTotalAmount(total);
        return toResponse(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponse updateStatus(Long id, String newStatus) {
        PurchaseOrder po = findById(id);
        String transition = po.getStatus() + "->" + newStatus;
        if (!VALID_TRANSITIONS.contains(transition))
            throw new BadRequestException("Invalid status transition: " + transition);
        po.setStatus(newStatus);
        return toResponse(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponse receiveItems(Long id, ReceiveItemsRequest req) {
        PurchaseOrder po = findById(id);
        if (!List.of("ORDERED", "PARTIALLY_RECEIVED").contains(po.getStatus()))
            throw new BadRequestException("Can only receive items for ORDERED or PARTIALLY_RECEIVED orders");

        Map<Long, PurchaseOrderItem> itemMap = new HashMap<>();
        for (PurchaseOrderItem item : po.getItems()) itemMap.put(item.getId(), item);

        User currentUser = getCurrentUser();
        for (ReceiveItemsRequest.ReceiveItemEntry entry : req.items()) {
            PurchaseOrderItem item = itemMap.get(entry.itemId());
            if (item == null) throw new ResourceNotFoundException("Order item", entry.itemId());

            int remaining = item.getQuantityOrdered() - item.getQuantityReceived();
            if (entry.quantityReceived() > remaining)
                throw new BadRequestException("Cannot receive more than ordered. Remaining: " + remaining);

            item.setQuantityReceived(item.getQuantityReceived() + entry.quantityReceived());

            // Update inventory
            Inventory inv = inventoryRepository.findByProductIdAndLocationIdForUpdate(
                    item.getProduct().getId(), po.getLocation().getId())
                    .orElseGet(() -> Inventory.builder()
                            .product(item.getProduct()).location(po.getLocation())
                            .quantityOnHand(0).quantityReserved(0).build());
            int before = inv.getQuantityOnHand();
            inv.setQuantityOnHand(before + entry.quantityReceived());
            inventoryRepository.save(inv);

            InventoryMovement mv = InventoryMovement.builder()
                    .product(item.getProduct()).location(po.getLocation())
                    .movementType("RECEIPT").quantity(entry.quantityReceived())
                    .quantityBefore(before).quantityAfter(inv.getQuantityOnHand())
                    .referenceId(po.getId()).referenceType("PURCHASE_ORDER")
                    .reason("PO Receipt: " + po.getOrderNumber())
                    .createdBy(currentUser).build();
            movementRepository.save(mv);
        }

        // Update PO status
        boolean allReceived = po.getItems().stream()
                .allMatch(i -> i.getQuantityReceived() >= i.getQuantityOrdered());
        boolean anyReceived = po.getItems().stream()
                .anyMatch(i -> i.getQuantityReceived() > 0);
        po.setStatus(allReceived ? "RECEIVED" : anyReceived ? "PARTIALLY_RECEIVED" : po.getStatus());
        return toResponse(purchaseOrderRepository.save(po));
    }

    private String generateOrderNumber() {
        String base = "PO-" + java.time.LocalDate.now().getYear() + "-";
        String random;
        do {
            random = base + String.format("%04d", (int)(Math.random() * 9000) + 1000);
        } while (purchaseOrderRepository.existsByOrderNumber(random));
        return random;
    }

    private User getCurrentUser() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            return userRepository.findByUsername(username).orElse(null);
        } catch (Exception e) { return null; }
    }

    private PurchaseOrder findById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", id));
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder po) {
        List<PurchaseOrderItemResponse> items = po.getItems().stream().map(i ->
                new PurchaseOrderItemResponse(i.getId(),
                        i.getProduct().getId(), i.getProduct().getSku(), i.getProduct().getName(),
                        i.getQuantityOrdered(), i.getQuantityReceived(),
                        i.getUnitCost(), i.getLineTotal())
        ).toList();
        return new PurchaseOrderResponse(po.getId(), po.getOrderNumber(),
                po.getSupplier().getId(), po.getSupplier().getName(),
                po.getLocation().getId(), po.getLocation().getName(),
                po.getStatus(), po.getOrderDate(), po.getExpectedDate(),
                po.getTotalAmount(), po.getNotes(), items,
                po.getCreatedAt(), po.getUpdatedAt());
    }
}
