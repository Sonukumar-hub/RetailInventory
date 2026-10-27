package com.stocksmart.dto.product;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(
    @NotBlank @Size(max=100) String sku,
    @NotBlank @Size(max=255) String name,
    String description,
    Long categoryId,
    @Size(max=100) String barcode,
    @NotBlank String unitOfMeasure,
    @NotNull @DecimalMin("0.00") BigDecimal costPrice,
    @NotNull @DecimalMin("0.00") BigDecimal sellingPrice,
    @Min(0) Integer reorderLevel
) {}
