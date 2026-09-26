package com.stocksense.inventory.movement;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for the {@code stock_movement} table (V002).
 * <p>
 * Stock movements are APPEND-ONLY physical inventory history.
 * Application code must never expose generic update/delete behaviour.
 * <p>
 * All FKs to product, location, and app_user are stored as scalar UUIDs
 * (owned by A and J respectively).
 * {@code reversalOfMovementId} self-references another stock_movement row.
 */
@Entity
@Table(name = "stock_movement")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /** FK → operation_line.id  (R-owned) */
    @Column(name = "operation_line_id", nullable = false, updatable = false)
    private UUID operationLineId;

    /** FK → product.id  (owned by A — scalar UUID) */
    @Column(name = "product_id", nullable = false, updatable = false)
    private UUID productId;

    /** FK → location.id  (owned by A — scalar UUID) */
    @Column(name = "source_location_id", nullable = false, updatable = false)
    private UUID sourceLocationId;

    /** FK → location.id  (owned by A — scalar UUID) */
    @Column(name = "destination_location_id", nullable = false, updatable = false)
    private UUID destinationLocationId;

    @Column(name = "qty", nullable = false, updatable = false, precision = 19, scale = 4)
    private BigDecimal qty;

    /** Self-reference: FK → stock_movement.id (nullable) */
    @Column(name = "reversal_of_movement_id", updatable = false)
    private UUID reversalOfMovementId;

    @Column(name = "moved_at", nullable = false, updatable = false)
    private Instant movedAt;

    /** FK → app_user.id  (owned by J — scalar UUID) */
    @Column(name = "created_by_user_id", updatable = false)
    private UUID createdByUserId;

    // ── Constructors ──────────────────────────────────────────────────────────

    public StockMovement() {}

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID getId() { return id; }

    public UUID getOperationLineId() { return operationLineId; }
    public void setOperationLineId(UUID operationLineId) { this.operationLineId = operationLineId; }

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }

    public UUID getSourceLocationId() { return sourceLocationId; }
    public void setSourceLocationId(UUID sourceLocationId) { this.sourceLocationId = sourceLocationId; }

    public UUID getDestinationLocationId() { return destinationLocationId; }
    public void setDestinationLocationId(UUID destinationLocationId) { this.destinationLocationId = destinationLocationId; }

    public BigDecimal getQty() { return qty; }
    public void setQty(BigDecimal qty) { this.qty = qty; }

    public UUID getReversalOfMovementId() { return reversalOfMovementId; }
    public void setReversalOfMovementId(UUID reversalOfMovementId) { this.reversalOfMovementId = reversalOfMovementId; }

    public Instant getMovedAt() { return movedAt; }
    public void setMovedAt(Instant movedAt) { this.movedAt = movedAt; }

    public UUID getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(UUID createdByUserId) { this.createdByUserId = createdByUserId; }

    // ── Pre-persist ───────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        if (movedAt == null) movedAt = Instant.now();
    }
}
