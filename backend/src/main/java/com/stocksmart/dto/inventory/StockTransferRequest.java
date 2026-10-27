package com.stocksmart.dto.inventory;
import jakarta.validation.constraints.*;
public record StockTransferRequest(
    @NotNull Long productId,
    @NotNull Long sourceLocationId,
    @NotNull Long destinationLocationId,
    @NotNull @Min(1) Integer quantity,
    String reason
) {}
