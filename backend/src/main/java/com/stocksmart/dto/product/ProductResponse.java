package com.stocksmart.dto.product;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
    Long id, String sku, String name, String description,
    Long categoryId, String categoryName,
    String barcode, String unitOfMeasure,
    BigDecimal costPrice, BigDecimal sellingPrice,
    Integer reorderLevel, Boolean active,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
