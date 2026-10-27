package com.stocksmart.dto.user;
import java.time.LocalDateTime;
import java.util.List;
public record UserResponse(Long id, String username, String email, String firstName, String lastName, Boolean active, List<String> roles, LocalDateTime createdAt) {}
