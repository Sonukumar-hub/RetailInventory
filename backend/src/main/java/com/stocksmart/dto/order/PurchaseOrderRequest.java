package com.stocksmart.dto.order;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
public record PurchaseOrderRequest(
    @NotNull Long supplierId,
    @NotNull Long locationId,
    @NotNull LocalDate orderDate,
    LocalDate expectedDate,
    String notes,
    @NotEmpty List<PurchaseOrderItemRequest> items
) {}
