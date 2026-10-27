package com.stocksmart.dto.category;
import jakarta.validation.constraints.*;
public record CategoryRequest(@NotBlank @Size(max=100) String name, @Size(max=500) String description) {}
