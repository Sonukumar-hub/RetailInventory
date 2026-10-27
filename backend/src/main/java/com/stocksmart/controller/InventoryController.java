package com.stocksmart.controller;

import com.stocksmart.dto.inventory.*;
import com.stocksmart.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory")
public class InventoryController {
    private final InventoryService inventoryService;

    @GetMapping("/location/{locationId}")
    @Operation(summary = "Get inventory at a specific location")
    public ResponseEntity<Page<InventoryResponse>> getByLocation(
            @PathVariable Long locationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.getInventoryByLocation(locationId, PageRequest.of(page, size)));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get inventory for a specific product across all locations")
    public ResponseEntity<List<InventoryResponse>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryForProduct(productId));
    }

    @PostMapping("/receive")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Receive stock into a location")
    public ResponseEntity<InventoryResponse> receiveStock(@Valid @RequestBody StockReceiveRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.receiveStock(req));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Adjust stock level (positive or negative)")
    public ResponseEntity<InventoryResponse> adjustStock(@Valid @RequestBody StockAdjustmentRequest req) {
        return ResponseEntity.ok(inventoryService.adjustStock(req));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    @Operation(summary = "Transfer stock between locations")
    public ResponseEntity<Void> transfer(@Valid @RequestBody StockTransferRequest req) {
        inventoryService.transferStock(req);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/movements")
    @Operation(summary = "Get inventory movement history")
    public ResponseEntity<Page<InventoryMovementResponse>> getMovements(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.getMovements(productId, locationId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }
}
