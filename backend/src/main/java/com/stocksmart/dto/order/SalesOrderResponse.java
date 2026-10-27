package com.stocksmart.dto.order;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
public record SalesOrderResponse(
    Long id, String orderNumber,
    Long locationId, String locationName,
    String customerName, String customerEmail,
    String status, LocalDate orderDate,
    BigDecimal totalAmount, String notes,
    List<SalesOrderItemResponse> items,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
