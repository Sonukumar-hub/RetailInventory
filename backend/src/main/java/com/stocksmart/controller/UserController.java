package com.stocksmart.controller;

import com.stocksmart.dto.user.*;
import com.stocksmart.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "User Management")
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.getAll(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @Valid @RequestBody UserRequest req) {
        return ResponseEntity.ok(userService.update(id, req));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<Void> toggleActive(@PathVariable Long id) {
        userService.toggleActive(id);
        return ResponseEntity.ok().build();
    }
}
