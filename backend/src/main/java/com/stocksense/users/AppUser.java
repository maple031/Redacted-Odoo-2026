package com.stocksense.users;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * JPA entity for the {@code app_user} table.
 *
 * <p>Schema is owned by Flyway (V001 + V003). Hibernate is set to {@code validate}
 * only — never modify the schema from here.
 *
 * <p>NEVER store or expose the raw password. Always use a {@code PasswordEncoder}.
 */
@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /** 6–12 characters, unique (case-insensitive). Enforced by DB constraint + app validation. */
    @Column(name = "login_id", nullable = false, length = 12)
    private String loginId;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    /** BCrypt hash — never the plaintext password. */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /** Whether this account may log in. Disabled accounts are rejected at login. */
    @Column(name = "active", nullable = false)
    private boolean active = true;

    /** {@code INVENTORY_MANAGER} or {@code WAREHOUSE_STAFF}. Defaults to {@code WAREHOUSE_STAFF}. */
    @Column(name = "role", nullable = false, length = 30)
    private String role = "WAREHOUSE_STAFF";

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // ── Lifecycle hooks ───────────────────────────────────────────────────────

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    // ── Constructors ──────────────────────────────────────────────────────────

    protected AppUser() {}

    public AppUser(String loginId, String email, String passwordHash) {
        this.loginId      = loginId;
        this.email        = email;
        this.passwordHash = passwordHash;
    }

    // ── Getters / setters ─────────────────────────────────────────────────────

    public UUID getId()                          { return id; }
    public String getLoginId()                   { return loginId; }
    public String getEmail()                     { return email; }
    public String getPasswordHash()              { return passwordHash; }
    public boolean isActive()                    { return active; }
    public String getRole()                      { return role; }
    public OffsetDateTime getLastLoginAt()        { return lastLoginAt; }
    public OffsetDateTime getCreatedAt()          { return createdAt; }
    public OffsetDateTime getUpdatedAt()          { return updatedAt; }

    public void setId(UUID id)                        { this.id = id; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setActive(boolean active)            { this.active = active; }
    public void setRole(String role)                 { this.role = role; }
    public void setLastLoginAt(OffsetDateTime t)     { this.lastLoginAt = t; }
}
