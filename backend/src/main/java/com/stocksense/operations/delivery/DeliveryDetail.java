package com.stocksense.operations.delivery;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for the {@code delivery_detail} table (V006).
 * <p>
 * Uses {@code operation_id} as the primary key (one-to-one with
 * {@code inventory_operation}).  The PK is NOT auto-generated.
 * <p>
 * {@code updatedAt} is maintained by the {@code delivery_detail_set_updated_at}
 * DB trigger — marked non-insertable/non-updatable.
 */
@Entity
@Table(name = "delivery_detail")
public class DeliveryDetail {

    /** Matches inventory_operation.id — supplied by caller. */
    @Id
    @Column(name = "operation_id", updatable = false, nullable = false)
    private UUID operationId;

    @Column(name = "delivery_address", nullable = false, columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Managed by DB trigger. */
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private Instant updatedAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public DeliveryDetail() {}

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID getOperationId() { return operationId; }
    public void setOperationId(UUID operationId) { this.operationId = operationId; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // ── Pre-persist ───────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
