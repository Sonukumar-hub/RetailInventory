package com.stocksmart.controller;

import com.stocksmart.dto.supplier.*;
import com.stocksmart.service.SupplierService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers")
public class SupplierController {
    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<Page<SupplierResponse>> search(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(supplierService.search(search, PageRequest.of(page, size, Sort.by("name"))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<SupplierResponse> create(@Valid @RequestBody SupplierRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<SupplierResponse> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest req) {
        return ResponseEntity.ok(supplierService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
