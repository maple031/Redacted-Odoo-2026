package com.stocksense.operations.core;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for the {@code inventory_operation} table (V002 + V005).
 * <p>
 * Cross-module foreign keys (partner_id, responsible_user_id, created_by_user_id,
 * reference_warehouse_id) are mapped as raw {@link UUID} scalar fields so that
 * R's branch remains independently compilable while A/J work on their modules.
 * <p>
 * {@code version} is the DB-managed optimistic lock column.
 * {@code updated_at} is maintained by the {@code inventory_operation_set_updated_at}
 * trigger — we mark it non-insertable/non-updatable so Hibernate never touches it.
 */
@Entity
@Table(name = "inventory_operation")
public class InventoryOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "reference_code", nullable = false, unique = true, length = 100)
    private String referenceCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private OperationType operationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OperationStatus status;

    /** FK → business_partner.id  (owned by A — stored as UUID) */
    @Column(name = "partner_id")
    private UUID partnerId;

    /** FK → app_user.id  (owned by J) */
    @Column(name = "responsible_user_id")
    private UUID responsibleUserId;

    /** FK → app_user.id  (owned by J) */
    @Column(name = "created_by_user_id")
    private UUID createdByUserId;

    /** FK → warehouse.id  (owned by A).  Added in V005. */
    @Column(name = "reference_warehouse_id", nullable = false)
    private UUID referenceWarehouseId;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "kanban_rank", nullable = false)
    private Long kanbanRank;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Optimistic-lock version column managed by the application
     * (DB has a non-negative check, starts at 0).
     */
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Managed by DB trigger — never written by Hibernate. */
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private Instant updatedAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public InventoryOperation() {}

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID getId() { return id; }

    public String getReferenceCode() { return referenceCode; }
    public void setReferenceCode(String referenceCode) { this.referenceCode = referenceCode; }

    public OperationType getOperationType() { return operationType; }
    public void setOperationType(OperationType operationType) { this.operationType = operationType; }

    public OperationStatus getStatus() { return status; }
    public void setStatus(OperationStatus status) { this.status = status; }

    public UUID getPartnerId() { return partnerId; }
    public void setPartnerId(UUID partnerId) { this.partnerId = partnerId; }

    public UUID getResponsibleUserId() { return responsibleUserId; }
    public void setResponsibleUserId(UUID responsibleUserId) { this.responsibleUserId = responsibleUserId; }

    public UUID getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(UUID createdByUserId) { this.createdByUserId = createdByUserId; }

    public UUID getReferenceWarehouseId() { return referenceWarehouseId; }
    public void setReferenceWarehouseId(UUID referenceWarehouseId) { this.referenceWarehouseId = referenceWarehouseId; }

    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public Instant getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(Instant cancelledAt) { this.cancelledAt = cancelledAt; }

    public Long getKanbanRank() { return kanbanRank; }
    public void setKanbanRank(Long kanbanRank) { this.kanbanRank = kanbanRank; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // ── Pre-persist ───────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (kanbanRank == null) kanbanRank = 1000L;
        if (version == null) version = 0L;
    }
}
