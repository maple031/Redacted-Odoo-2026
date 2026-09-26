package com.stocksense.users;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * JPA entity for the {@code password_reset_challenge} table (V003).
 *
 * <p>A challenge is "active" when {@code consumedAt} is null and {@code expiresAt}
 * is in the future. It must be consumed atomically with the password update.
 *
 * <p>NEVER store the raw reset code — only the BCrypt hash in {@code codeHash}.
 */
@Entity
@Table(name = "password_reset_challenge")
public class PasswordResetChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private AppUser user;

    /** BCrypt hash of the one-time reset code. Never the raw code. */
    @Column(name = "code_hash", nullable = false, length = 255)
    private String codeHash;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    /** Incremented on each failed verification attempt. */
    @Column(name = "attempt_count", nullable = false)
    private int attemptCount = 0;

    /** Set (non-null) once the challenge has been used. */
    @Column(name = "consumed_at")
    private OffsetDateTime consumedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    // ── Constructors ──────────────────────────────────────────────────────────

    protected PasswordResetChallenge() {}

    public PasswordResetChallenge(AppUser user, String codeHash, OffsetDateTime expiresAt) {
        this.user      = user;
        this.codeHash  = codeHash;
        this.expiresAt = expiresAt;
    }

    // ── Domain helpers ────────────────────────────────────────────────────────

    public boolean isExpired()   { return OffsetDateTime.now().isAfter(expiresAt); }
    public boolean isConsumed()  { return consumedAt != null; }

    public void consume() {
        this.consumedAt = OffsetDateTime.now();
    }

    public void incrementAttempt() {
        this.attemptCount++;
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public UUID getId()               { return id; }
    public AppUser getUser()          { return user; }
    public String getCodeHash()       { return codeHash; }
    public OffsetDateTime getExpiresAt()  { return expiresAt; }
    public int getAttemptCount()      { return attemptCount; }
    public OffsetDateTime getConsumedAt() { return consumedAt; }
    public OffsetDateTime getCreatedAt()  { return createdAt; }
}
