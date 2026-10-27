package com.stocksmart.controller;

import com.stocksmart.dto.order.*;
import com.stocksmart.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Orders")
public class PurchaseOrderController {
    private final PurchaseOrderService service;

    @GetMapping
    public ResponseEntity<Page<PurchaseOrderResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAll(status, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> create(@Valid @RequestBody PurchaseOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> receiveItems(
            @PathVariable Long id, @Valid @RequestBody ReceiveItemsRequest req) {
        return ResponseEntity.ok(service.receiveItems(id, req));
    }
}
