package com.stocksmart.dto.category;
import java.time.LocalDateTime;
public record CategoryResponse(Long id, String name, String description, Boolean active, LocalDateTime createdAt) {}
