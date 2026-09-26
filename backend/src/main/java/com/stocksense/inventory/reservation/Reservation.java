package com.stocksense.inventory.reservation;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for the {@code reservation} table (V002).
 * <p>
 * Reservations commit available stock for pending DELIVERY or TRANSFER operations.
 * They are not created for RECEIPT or ADJUSTMENT.
 * <p>
 * {@code locationId} is a scalar UUID FK (location owned by A).
 * {@code operationLineId} is a scalar UUID FK (R-owned operation_line).
 */
@Entity
@Table(name = "reservation")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /** FK → operation_line.id  (R-owned) */
    @Column(name = "operation_line_id", nullable = false)
    private UUID operationLineId;

    /** FK → location.id  (owned by A — scalar UUID) */
    @Column(name = "location_id", nullable = false)
    private UUID locationId;

    @Column(name = "qty", nullable = false, precision = 19, scale = 4)
    private BigDecimal qty;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReservationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    protected Reservation() {}

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID getId() { return id; }

    public UUID getOperationLineId() { return operationLineId; }
    public void setOperationLineId(UUID operationLineId) { this.operationLineId = operationLineId; }

    public UUID getLocationId() { return locationId; }
    public void setLocationId(UUID locationId) { this.locationId = locationId; }

    public BigDecimal getQty() { return qty; }
    public void setQty(BigDecimal qty) { this.qty = qty; }

    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }

    // ── Pre-persist ───────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = ReservationStatus.ACTIVE;
    }
}
