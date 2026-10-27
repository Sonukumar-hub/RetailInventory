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
import java.util.*;

@Service
@RequiredArgsConstructor
public class SalesOrderService {
    private final SalesOrderRepository salesOrderRepository;
    private final LocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;

    private static final List<String> VALID_TRANSITIONS = List.of(
            "PENDING->PROCESSING", "PROCESSING->COMPLETED",
            "PENDING->CANCELLED", "PROCESSING->CANCELLED"
    );

    @Transactional(readOnly = true)
    public Page<SalesOrderResponse> getAll(String status, Pageable pageable) {
        return salesOrderRepository.findByStatusFilter(status, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public SalesOrderResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public SalesOrderResponse create(SalesOrderRequest req) {
        Location location = locationRepository.findById(req.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", req.locationId()));

        // Validate stock availability first
        for (SalesOrderItemRequest item : req.items()) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", item.productId()));
            Inventory inv = inventoryRepository.findByProductIdAndLocationId(item.productId(), req.locationId())
                    .orElseThrow(() -> new InsufficientStockException(
                            "No stock found for product '" + product.getName() + "' at specified location"));
            if (inv.getAvailableQuantity() < item.quantity())
                throw new InsufficientStockException(
                        "Insufficient stock for '" + product.getName() + "'. Available: " + inv.getAvailableQuantity());
        }

        String orderNumber = generateOrderNumber();
        SalesOrder so = SalesOrder.builder()
                .orderNumber(orderNumber).location(location)
                .customerName(req.customerName()).customerEmail(req.customerEmail())
                .status("PENDING").orderDate(req.orderDate()).notes(req.notes())
                .createdBy(getCurrentUser()).items(new ArrayList<>()).build();

        BigDecimal total = BigDecimal.ZERO;
        for (SalesOrderItemRequest item : req.items()) {
            Product product = productRepository.findById(item.productId()).orElseThrow();
            BigDecimal lineTotal = item.unitPrice().multiply(BigDecimal.valueOf(item.quantity()));
            total = total.add(lineTotal);
            so.getItems().add(SalesOrderItem.builder()
                    .salesOrder(so).product(product)
                    .quantity(item.quantity()).unitPrice(item.unitPrice()).lineTotal(lineTotal).build());
        }
        so.setTotalAmount(total);
        return toResponse(salesOrderRepository.save(so));
    }

    @Transactional
    public SalesOrderResponse updateStatus(Long id, String newStatus) {
        SalesOrder so = findById(id);
        String transition = so.getStatus() + "->" + newStatus;
        if (!VALID_TRANSITIONS.contains(transition))
            throw new BadRequestException("Invalid status transition: " + transition);

        User currentUser = getCurrentUser();

        if ("COMPLETED".equals(newStatus)) {
            // Deduct stock when completing
            for (SalesOrderItem item : so.getItems()) {
                Inventory inv = inventoryRepository.findByProductIdAndLocationIdForUpdate(
                        item.getProduct().getId(), so.getLocation().getId())
                        .orElseThrow(() -> new InsufficientStockException(
                                "No inventory for product: " + item.getProduct().getName()));
                if (inv.getAvailableQuantity() < item.getQuantity())
                    throw new InsufficientStockException(
                            "Insufficient stock for: " + item.getProduct().getName());
                int before = inv.getQuantityOnHand();
                inv.setQuantityOnHand(before - item.getQuantity());
                inventoryRepository.save(inv);

                movementRepository.save(InventoryMovement.builder()
                        .product(item.getProduct()).location(so.getLocation())
                        .movementType("SALE").quantity(-item.getQuantity())
                        .quantityBefore(before).quantityAfter(inv.getQuantityOnHand())
                        .referenceId(so.getId()).referenceType("SALES_ORDER")
                        .reason("Sale: " + so.getOrderNumber()).createdBy(currentUser).build());
            }
        } else if ("CANCELLED".equals(newStatus) && "PROCESSING".equals(so.getStatus())) {
            // If was processing, no stock was deducted yet
        }

        so.setStatus(newStatus);
        return toResponse(salesOrderRepository.save(so));
    }

    private String generateOrderNumber() {
        String base = "SO-" + java.time.LocalDate.now().getYear() + "-";
        String random;
        do {
            random = base + String.format("%04d", (int)(Math.random() * 9000) + 1000);
        } while (salesOrderRepository.existsByOrderNumber(random));
        return random;
    }

    private User getCurrentUser() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            return userRepository.findByUsername(username).orElse(null);
        } catch (Exception e) { return null; }
    }

    private SalesOrder findById(Long id) {
        return salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order", id));
    }

    private SalesOrderResponse toResponse(SalesOrder so) {
        List<SalesOrderItemResponse> items = so.getItems().stream().map(i ->
                new SalesOrderItemResponse(i.getId(),
                        i.getProduct().getId(), i.getProduct().getSku(), i.getProduct().getName(),
                        i.getQuantity(), i.getUnitPrice(), i.getLineTotal())
        ).toList();
        return new SalesOrderResponse(so.getId(), so.getOrderNumber(),
                so.getLocation().getId(), so.getLocation().getName(),
                so.getCustomerName(), so.getCustomerEmail(),
                so.getStatus(), so.getOrderDate(),
                so.getTotalAmount(), so.getNotes(), items,
                so.getCreatedAt(), so.getUpdatedAt());
    }
}
