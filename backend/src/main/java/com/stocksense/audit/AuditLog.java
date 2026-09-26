package com.stocksense.audit;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for the {@code audit_log} table (V002).
 * <p>
 * Audit records are append-only — they are never updated or deleted.
 * <p>
 * {@code beforeState} and {@code afterState} are stored as PostgreSQL JSONB.
 * The Hibernate {@link SqlTypes#JSON} type code maps them as String payloads
 * that are directly serialized/deserialized by the JDBC driver without any
 * additional Jackson dependency being required at the entity layer.
 * <p>
 * Security constraint: audit records MUST NOT contain passwords, password
 * hashes, reset secrets, or session secrets.  This is a design-level rule
 * enforced at the call site (the service that writes audit entries), not in
 * this entity.
 * <p>
 * {@code actorUserId} is a scalar UUID FK (app_user owned by J).
 */
@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "entity_type", nullable = false, updatable = false, length = 50)
    private String entityType;

    @Column(name = "entity_id", nullable = false, updatable = false)
    private UUID entityId;

    @Column(name = "action", nullable = false, updatable = false, length = 50)
    private String action;

    /** FK → app_user.id  (owned by J — scalar UUID, nullable) */
    @Column(name = "actor_user_id", updatable = false)
    private UUID actorUserId;

    @Column(name = "correlation_id", updatable = false)
    private UUID correlationId;

    /**
     * JSONB column. Stored as a raw JSON string. Must not contain secrets.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_state", updatable = false, columnDefinition = "jsonb")
    private String beforeState;

    /**
     * JSONB column. Stored as a raw JSON string. Must not contain secrets.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_state", updatable = false, columnDefinition = "jsonb")
    private String afterState;

    @Column(name = "reason", updatable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public AuditLog() {}

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID getId() { return id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public UUID getActorUserId() { return actorUserId; }
    public void setActorUserId(UUID actorUserId) { this.actorUserId = actorUserId; }

    public UUID getCorrelationId() { return correlationId; }
    public void setCorrelationId(UUID correlationId) { this.correlationId = correlationId; }

    public String getBeforeState() { return beforeState; }
    public void setBeforeState(String beforeState) { this.beforeState = beforeState; }

    public String getAfterState() { return afterState; }
    public void setAfterState(String afterState) { this.afterState = afterState; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Instant getCreatedAt() { return createdAt; }

    // ── Pre-persist ───────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
