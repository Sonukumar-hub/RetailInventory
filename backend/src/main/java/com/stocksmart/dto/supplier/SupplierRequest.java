package com.stocksmart.dto.supplier;
import jakarta.validation.constraints.*;
public record SupplierRequest(
    @NotBlank @Size(max=255) String name,
    String contactPerson,
    @Email String email, String phone,
    String address, String city, String state, String country
) {}
