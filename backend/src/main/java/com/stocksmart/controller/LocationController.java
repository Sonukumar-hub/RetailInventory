package com.stocksmart.controller;

import com.stocksmart.dto.location.*;
import com.stocksmart.service.LocationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
@Tag(name = "Locations")
public class LocationController {
    private final LocationService locationService;

    @GetMapping
    public ResponseEntity<Page<LocationResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(locationService.getAll(PageRequest.of(page, size, Sort.by("name"))));
    }

    @GetMapping("/all")
    public ResponseEntity<List<LocationResponse>> getAllList() {
        return ResponseEntity.ok(locationService.getAllList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<LocationResponse> create(@Valid @RequestBody LocationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<LocationResponse> update(@PathVariable Long id, @Valid @RequestBody LocationRequest req) {
        return ResponseEntity.ok(locationService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        locationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
