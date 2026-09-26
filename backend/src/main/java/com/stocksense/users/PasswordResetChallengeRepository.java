package com.stocksense.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link PasswordResetChallenge}.
 */
public interface PasswordResetChallengeRepository extends JpaRepository<PasswordResetChallenge, UUID> {

    /**
     * Find all active (unconsumed, unexpired) challenges for a user, ordered most-recent first.
     */
    @Query("""
        SELECT c FROM PasswordResetChallenge c
        WHERE c.user.id = :userId
          AND c.consumedAt IS NULL
          AND c.expiresAt > CURRENT_TIMESTAMP
        ORDER BY c.createdAt DESC
        """)
    List<PasswordResetChallenge> findActiveChallengesByUserId(@Param("userId") UUID userId);

    /**
     * Find ALL unconsumed challenges for a user (including expired), to consume them all
     * when a successful reset happens (single-use guarantee).
     */
    @Query("""
        SELECT c FROM PasswordResetChallenge c
        WHERE c.user.id = :userId
          AND c.consumedAt IS NULL
        """)
    List<PasswordResetChallenge> findUnconsumedByUserId(@Param("userId") UUID userId);
}
