package com.stocksmart.dto.order;
import java.math.BigDecimal;
public record SalesOrderItemResponse(
    Long id, Long productId, String productSku, String productName,
    Integer quantity, BigDecimal unitPrice, BigDecimal lineTotal
) {}
