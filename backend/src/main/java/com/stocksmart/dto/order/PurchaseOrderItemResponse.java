package com.stocksmart.dto.order;
import java.math.BigDecimal;
public record PurchaseOrderItemResponse(
    Long id, Long productId, String productSku, String productName,
    Integer quantityOrdered, Integer quantityReceived,
    BigDecimal unitCost, BigDecimal lineTotal
) {}
