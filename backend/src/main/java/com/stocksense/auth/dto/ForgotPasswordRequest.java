package com.stocksense.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for {@code POST /api/auth/forgot-password}.
 *
 * <p>Accepts either a login ID or email. The server does not reveal
 * whether the account exists.
 */
public record ForgotPasswordRequest(
        @NotBlank(message = "Email or Login ID is required")
        String emailOrLoginId
) {}
