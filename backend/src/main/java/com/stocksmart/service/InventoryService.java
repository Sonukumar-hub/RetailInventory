package com.stocksmart.service;

import com.stocksmart.dto.inventory.*;
import com.stocksmart.entity.*;
import com.stocksmart.exception.*;
import com.stocksmart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<InventoryResponse> getInventoryByLocation(Long locationId, Pageable pageable) {
        return inventoryRepository.findByLocationIdWithDetails(locationId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getInventoryForProduct(Long productId) {
        return inventoryRepository.findByProductId(productId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public InventoryResponse receiveStock(StockReceiveRequest req) {
        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", req.productId()));
        Location location = locationRepository.findById(req.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", req.locationId()));

        Inventory inv = inventoryRepository.findByProductIdAndLocationIdForUpdate(req.productId(), req.locationId())
                .orElseGet(() -> Inventory.builder().product(product).location(location).quantityOnHand(0).quantityReserved(0).build());

        int before = inv.getQuantityOnHand();
        inv.setQuantityOnHand(before + req.quantity());
        inv = inventoryRepository.save(inv);

        recordMovement(product, location, "RECEIPT", req.quantity(), before, inv.getQuantityOnHand(),
                null, "MANUAL", req.reason());
        return toResponse(inv);
    }

    @Transactional
    public InventoryResponse adjustStock(StockAdjustmentRequest req) {
        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", req.productId()));
        Location location = locationRepository.findById(req.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", req.locationId()));

        Inventory inv = inventoryRepository.findByProductIdAndLocationIdForUpdate(req.productId(), req.locationId())
                .orElseGet(() -> Inventory.builder().product(product).location(location).quantityOnHand(0).quantityReserved(0).build());

        int before = inv.getQuantityOnHand();
        int newQty = before + req.quantity();
        if (newQty < 0) throw new InsufficientStockException(
                "Adjustment would result in negative stock. Current: " + before + ", Adjustment: " + req.quantity());

        inv.setQuantityOnHand(newQty);
        inv = inventoryRepository.save(inv);

        recordMovement(product, location, "ADJUSTMENT", req.quantity(), before, inv.getQuantityOnHand(),
                null, "MANUAL", req.reason());
        return toResponse(inv);
    }

    @Transactional
    public void transferStock(StockTransferRequest req) {
        if (req.sourceLocationId().equals(req.destinationLocationId()))
            throw new BadRequestException("Source and destination locations must be different");

        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", req.productId()));
        Location source = locationRepository.findById(req.sourceLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Source location", req.sourceLocationId()));
        Location dest = locationRepository.findById(req.destinationLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination location", req.destinationLocationId()));

        Inventory srcInv = inventoryRepository.findByProductIdAndLocationIdForUpdate(req.productId(), req.sourceLocationId())
                .orElseThrow(() -> new InsufficientStockException("No stock found at source location"));

        if (srcInv.getAvailableQuantity() < req.quantity())
            throw new InsufficientStockException("Insufficient available stock. Available: " + srcInv.getAvailableQuantity());

        int srcBefore = srcInv.getQuantityOnHand();
        srcInv.setQuantityOnHand(srcBefore - req.quantity());
        inventoryRepository.save(srcInv);

        Inventory dstInv = inventoryRepository.findByProductIdAndLocationIdForUpdate(req.productId(), req.destinationLocationId())
                .orElseGet(() -> Inventory.builder().product(product).location(dest).quantityOnHand(0).quantityReserved(0).build());

        int dstBefore = dstInv.getQuantityOnHand();
        dstInv.setQuantityOnHand(dstBefore + req.quantity());
        inventoryRepository.save(dstInv);

        String reason = req.reason() != null ? req.reason() : "Transfer between locations";
        recordMovement(product, source, "TRANSFER_OUT", -req.quantity(), srcBefore, srcInv.getQuantityOnHand(), null, "TRANSFER", reason);
        recordMovement(product, dest, "TRANSFER_IN", req.quantity(), dstBefore, dstInv.getQuantityOnHand(), null, "TRANSFER", reason);
    }

    @Transactional(readOnly = true)
    public Page<InventoryMovementResponse> getMovements(Long productId, Long locationId, Pageable pageable) {
        Page<InventoryMovement> page;
        if (productId != null) page = movementRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        else if (locationId != null) page = movementRepository.findByLocationIdOrderByCreatedAtDesc(locationId, pageable);
        else page = movementRepository.findAll(pageable);
        return page.map(this::toMovementResponse);
    }

    private void recordMovement(Product product, Location location, String type, int qty,
                                 int before, int after, Long refId, String refType, String reason) {
        User currentUser = null;
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            currentUser = userRepository.findByUsername(username).orElse(null);
        } catch (Exception ignored) {}

        InventoryMovement mv = InventoryMovement.builder()
                .product(product).location(location).movementType(type)
                .quantity(qty).quantityBefore(before).quantityAfter(after)
                .referenceId(refId).referenceType(refType).reason(reason)
                .createdBy(currentUser).build();
        movementRepository.save(mv);
    }

    private InventoryResponse toResponse(Inventory i) {
        return new InventoryResponse(
                i.getId(),
                i.getProduct().getId(), i.getProduct().getSku(), i.getProduct().getName(),
                i.getLocation().getId(), i.getLocation().getName(),
                i.getQuantityOnHand(), i.getQuantityReserved(), i.getAvailableQuantity()
        );
    }

    private InventoryMovementResponse toMovementResponse(InventoryMovement m) {
        return new InventoryMovementResponse(
                m.getId(),
                m.getProduct().getId(), m.getProduct().getSku(), m.getProduct().getName(),
                m.getLocation().getId(), m.getLocation().getName(),
                m.getMovementType(), m.getQuantity(),
                m.getQuantityBefore(), m.getQuantityAfter(),
                m.getReferenceId(), m.getReferenceType(), m.getReason(),
                m.getCreatedBy() != null ? m.getCreatedBy().getUsername() : null,
                m.getCreatedAt()
        );
    }
}
