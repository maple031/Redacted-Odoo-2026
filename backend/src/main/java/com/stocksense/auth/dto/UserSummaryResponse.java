package com.stocksense.auth.dto;

import com.stocksense.users.AppUser;

/**
 * Safe user representation for API responses.
 *
 * <p>Matches the {@code UserSummary} shape from
 * {@code docs/contracts/frontend-data-shapes.md}.
 * NEVER includes passwordHash or reset code hashes.
 */
public record UserSummaryResponse(
        String id,
        String loginId,
        String email,
        String role,
        boolean active
) {
    public static UserSummaryResponse from(AppUser user) {
        return new UserSummaryResponse(
                user.getId().toString(),
                user.getLoginId(),
                user.getEmail(),
                user.getRole(),
                user.isActive()
        );
    }
}
