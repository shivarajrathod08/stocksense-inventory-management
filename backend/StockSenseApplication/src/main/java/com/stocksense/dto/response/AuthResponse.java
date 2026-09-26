package com.stocksense.dto.response;

import java.time.LocalDateTime;
import java.util.Set;

public record AuthResponse(
        String token,
        String type,
        Long id,
        String name,
        String email,
        Set<String> roles
) {
    public static AuthResponse of(String token, Long id, String name, String email, Set<String> roles) {
        return new AuthResponse(token, "Bearer", id, name, email, roles);
    }
}
