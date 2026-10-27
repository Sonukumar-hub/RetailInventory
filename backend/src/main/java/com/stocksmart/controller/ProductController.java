package com.stocksmart.controller;

import com.stocksmart.dto.product.*;
import com.stocksmart.service.ProductService;
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
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Products")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Search and list products")
    public ResponseEntity<Page<ProductResponse>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sort,
            @RequestParam(defaultValue = "asc") String dir) {
        Sort.Direction direction = "desc".equalsIgnoreCase(dir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return ResponseEntity.ok(productService.searchProducts(search, categoryId,
                PageRequest.of(page, size, Sort.by(direction, sort))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/search/barcode")
    @Operation(summary = "Search product by SKU or barcode")
    public ResponseEntity<ProductResponse> getBySkuOrBarcode(@RequestParam String value) {
        return ResponseEntity.ok(productService.getBySkuOrBarcode(value));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get low-stock products")
    public ResponseEntity<List<ProductResponse>> getLowStock() {
        return ResponseEntity.ok(productService.getLowStockProducts());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(productService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        productService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
