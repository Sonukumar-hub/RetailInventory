package com.stocksmart.controller;

import com.stocksmart.dto.order.*;
import com.stocksmart.service.SalesOrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sales-orders")
@RequiredArgsConstructor
@Tag(name = "Sales Orders")
public class SalesOrderController {
    private final SalesOrderService service;

    @GetMapping
    public ResponseEntity<Page<SalesOrderResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAll(status, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER','STAFF')")
    public ResponseEntity<SalesOrderResponse> create(@Valid @RequestBody SalesOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<SalesOrderResponse> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
}
