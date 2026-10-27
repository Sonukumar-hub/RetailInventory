package com.stocksmart.dto.order;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
public record SalesOrderRequest(
    @NotNull Long locationId,
    String customerName, String customerEmail,
    @NotNull LocalDate orderDate,
    String notes,
    @NotEmpty List<SalesOrderItemRequest> items
) {}
