package com.stocksmart.dto.inventory;
import jakarta.validation.constraints.*;
public record StockAdjustmentRequest(
    @NotNull Long productId,
    @NotNull Long locationId,
    @NotNull Integer quantity,
    @NotBlank String reason
) {}
