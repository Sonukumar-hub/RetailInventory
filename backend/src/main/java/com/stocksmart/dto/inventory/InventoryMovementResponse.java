package com.stocksmart.dto.inventory;
import java.time.LocalDateTime;
public record InventoryMovementResponse(
    Long id, Long productId, String productSku, String productName,
    Long locationId, String locationName,
    String movementType, Integer quantity,
    Integer quantityBefore, Integer quantityAfter,
    Long referenceId, String referenceType, String reason,
    String createdBy, LocalDateTime createdAt
) {}
