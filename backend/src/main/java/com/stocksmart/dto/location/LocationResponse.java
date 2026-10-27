package com.stocksmart.dto.location;
import java.time.LocalDateTime;
public record LocationResponse(Long id, String name, String type, String address, String city, String state, String country, Boolean active, LocalDateTime createdAt) {}
