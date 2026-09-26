package com.stocksense.operations.core;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for the {@code operation_sequence} table (V005).
 * <p>
 * Each row represents the current sequence counter for a given
 * (warehouse, operation_type) pair.  Locking this row with
 * {@code SELECT ... FOR UPDATE} before reading and incrementing
 * {@code nextValue} is mandatory to prevent duplicate reference codes.
 * <p>
 * {@code warehouseId} is a scalar UUID FK — warehouse is owned by A.
 */
@Entity
@Table(name = "operation_sequence")
public class OperationSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /** FK → warehouse.id  (owned by A — scalar UUID) */
    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private OperationType operationType;

    @Column(name = "next_value", nullable = false)
    private Long nextValue;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Managed by DB trigger. */
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private Instant updatedAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public OperationSequence() {}

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID getId() { return id; }

    public UUID getWarehouseId() { return warehouseId; }
    public void setWarehouseId(UUID warehouseId) { this.warehouseId = warehouseId; }

    public OperationType getOperationType() { return operationType; }
    public void setOperationType(OperationType operationType) { this.operationType = operationType; }

    public Long getNextValue() { return nextValue; }
    public void setNextValue(Long nextValue) { this.nextValue = nextValue; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // ── Pre-persist ───────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (nextValue == null) nextValue = 1L;
    }
}
