package com.stocksmart.dto.order;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
public record PurchaseOrderResponse(
    Long id, String orderNumber,
    Long supplierId, String supplierName,
    Long locationId, String locationName,
    String status, LocalDate orderDate, LocalDate expectedDate,
    BigDecimal totalAmount, String notes,
    List<PurchaseOrderItemResponse> items,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
