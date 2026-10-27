package com.stocksmart.dto.supplier;
import java.time.LocalDateTime;
public record SupplierResponse(Long id, String name, String contactPerson, String email, String phone, String address, String city, String state, String country, Boolean active, LocalDateTime createdAt) {}
