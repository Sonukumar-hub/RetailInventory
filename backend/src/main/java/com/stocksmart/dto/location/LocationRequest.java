package com.stocksmart.dto.location;
import jakarta.validation.constraints.*;
public record LocationRequest(
    @NotBlank @Size(max=255) String name,
    @NotBlank String type,
    String address, String city, String state, String country
) {}
