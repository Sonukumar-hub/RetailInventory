package com.stocksmart.dto.inventory;
import jakarta.validation.constraints.*;
public record StockReceiveRequest(
    @NotNull Long productId,
    @NotNull Long locationId,
    @NotNull @Min(1) Integer quantity,
    String reason
) {}
