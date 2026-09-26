package com.stocksense.operations.adjustment;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for {@code inventory_adjustment_detail} (V002).
 * <p>
 * Uses {@code operation_line_id} as the primary key (one-to-one with
 * {@code operation_line}).  The PK is NOT auto-generated — the caller must
 * supply the matching {@code operation_line.id}.
 * <p>
 * {@code locationId} is a scalar UUID FK (→ location.id, owned by A).
 */
@Entity
@Table(name = "inventory_adjustment_detail")
public class InventoryAdjustmentDetail {

    /** Matches operation_line.id — supplied by caller. */
    @Id
    @Column(name = "operation_line_id", updatable = false, nullable = false)
    private UUID operationLineId;

    /** FK → location.id  (owned by A — scalar UUID) */
    @Column(name = "location_id", nullable = false)
    private UUID locationId;

    @Column(name = "system_qty", nullable = false, precision = 19, scale = 4)
    private BigDecimal systemQty;

    @Column(name = "counted_qty", nullable = false, precision = 19, scale = 4)
    private BigDecimal countedQty;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason_code", nullable = false, length = 30)
    private AdjustmentReasonCode reasonCode;

    @Column(name = "counted_at", nullable = false)
    private Instant countedAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    protected InventoryAdjustmentDetail() {}

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID getOperationLineId() { return operationLineId; }
    public void setOperationLineId(UUID operationLineId) { this.operationLineId = operationLineId; }

    public UUID getLocationId() { return locationId; }
    public void setLocationId(UUID locationId) { this.locationId = locationId; }

    public BigDecimal getSystemQty() { return systemQty; }
    public void setSystemQty(BigDecimal systemQty) { this.systemQty = systemQty; }

    public BigDecimal getCountedQty() { return countedQty; }
    public void setCountedQty(BigDecimal countedQty) { this.countedQty = countedQty; }

    public AdjustmentReasonCode getReasonCode() { return reasonCode; }
    public void setReasonCode(AdjustmentReasonCode reasonCode) { this.reasonCode = reasonCode; }

    public Instant getCountedAt() { return countedAt; }
    public void setCountedAt(Instant countedAt) { this.countedAt = countedAt; }

    // ── Pre-persist ───────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        if (countedAt == null) countedAt = Instant.now();
    }
}
