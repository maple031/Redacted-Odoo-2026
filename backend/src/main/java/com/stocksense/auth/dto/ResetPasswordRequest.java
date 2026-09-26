package com.stocksense.auth.dto;

import jakarta.validation.constraints.*;

/**
 * Request body for {@code POST /api/auth/reset-password}.
 */
public record ResetPasswordRequest(
        @NotBlank(message = "Reset code is required")
        String resetCode,

        @NotBlank(message = "Email or Login ID is required")
        String emailOrLoginId,

        @NotBlank(message = "New password is required")
        @Size(min = 9, message = "Password must be more than 8 characters")
        @Pattern(regexp = ".*[a-z].*", message = "Must contain at least one lowercase letter")
        @Pattern(regexp = ".*[A-Z].*", message = "Must contain at least one uppercase letter")
        @Pattern(regexp = ".*[^a-zA-Z0-9].*", message = "Must contain at least one special character")
        String newPassword,

        @NotBlank(message = "Please re-enter your new password")
        String confirmPassword
) {}
