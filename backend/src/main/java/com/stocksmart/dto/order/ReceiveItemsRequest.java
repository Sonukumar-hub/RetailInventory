package com.stocksmart.dto.order;
import jakarta.validation.constraints.*;
import java.util.List;
public record ReceiveItemsRequest(@NotEmpty List<ReceiveItemEntry> items) {
    public record ReceiveItemEntry(@NotNull Long itemId, @NotNull @Min(0) Integer quantityReceived) {}
}
