package com.stocksmart.dto.user;
import jakarta.validation.constraints.*;
import java.util.List;
public record UserRequest(
    @NotBlank @Size(min=3,max=50) String username,
    @NotBlank @Email String email,
    @NotBlank @Size(min=6) String password,
    String firstName, String lastName,
    @NotEmpty List<String> roles
) {}
