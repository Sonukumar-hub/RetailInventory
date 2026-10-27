package com.stocksmart.dto.inventory;
public record InventoryResponse(
    Long id, Long productId, String productSku, String productName,
    Long locationId, String locationName,
    Integer quantityOnHand, Integer quantityReserved, Integer availableQuantity
) {}
