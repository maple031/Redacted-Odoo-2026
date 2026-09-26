package com.stocksense.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link AppUser}.
 *
 * <p>All lookups are case-insensitive to match the database unique indexes on
 * {@code lower(login_id)} and {@code lower(email)} from V003.
 */
public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    /** Find by login_id (case-insensitive). */
    @Query("SELECT u FROM AppUser u WHERE LOWER(u.loginId) = LOWER(:loginId)")
    Optional<AppUser> findByLoginIdIgnoreCase(@Param("loginId") String loginId);

    /** Find by email (case-insensitive). */
    @Query("SELECT u FROM AppUser u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<AppUser> findByEmailIgnoreCase(@Param("email") String email);

    /** Find by login_id OR email — used during login to allow either identifier. */
    @Query("SELECT u FROM AppUser u WHERE LOWER(u.loginId) = LOWER(:value) OR LOWER(u.email) = LOWER(:value)")
    Optional<AppUser> findByLoginIdOrEmailIgnoreCase(@Param("value") String value);

    boolean existsByLoginIdIgnoreCase(String loginId);
    boolean existsByEmailIgnoreCase(String email);

    /** Atomically update last_login_at without a full entity load. */
    @Modifying
    @Query("UPDATE AppUser u SET u.lastLoginAt = :now WHERE u.id = :id")
    void updateLastLoginAt(@Param("id") UUID id, @Param("now") OffsetDateTime now);
}
