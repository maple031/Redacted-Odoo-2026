package com.stocksense.auth.dto;

import jakarta.validation.constraints.*;

/**
 * Request body for {@code POST /api/auth/signup}.
 *
 * <p>Server-side validation mirrors the frontend Zod schema.
 */
public record SignupRequest(
        @NotBlank(message = "Login ID is required")
        @Size(min = 6, max = 12, message = "Login ID must be between 6 and 12 characters")
        String loginId,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 9, message = "Password must be more than 8 characters")
        @Pattern(regexp = ".*[a-z].*", message = "Must contain at least one lowercase letter")
        @Pattern(regexp = ".*[A-Z].*", message = "Must contain at least one uppercase letter")
        @Pattern(regexp = ".*[^a-zA-Z0-9].*", message = "Must contain at least one special character")
        String password,

        @NotBlank(message = "Please re-enter your password")
        String confirmPassword
) {}
