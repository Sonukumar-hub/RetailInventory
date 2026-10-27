package com.stocksmart.dto.order;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record SalesOrderItemRequest(
    @NotNull Long productId,
    @NotNull @Min(1) Integer quantity,
    @NotNull @DecimalMin("0.01") BigDecimal unitPrice
) {}
