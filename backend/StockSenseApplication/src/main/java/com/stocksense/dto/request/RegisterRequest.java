package com.stocksense.dto.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank @Email(message = "Valid email required") String email,
        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters") String password
) {}
