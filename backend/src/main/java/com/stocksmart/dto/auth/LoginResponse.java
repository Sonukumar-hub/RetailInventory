package com.stocksmart.dto.auth;
import java.util.List;
public record LoginResponse(String token, String tokenType, String username, String email, List<String> roles) {
    public static LoginResponse of(String token, String username, String email, List<String> roles) {
        return new LoginResponse(token, "Bearer", username, email, roles);
    }
}
