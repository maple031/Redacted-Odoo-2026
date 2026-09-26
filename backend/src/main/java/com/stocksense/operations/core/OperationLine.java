package com.stocksense.operations.core;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for the {@code operation_line} table (V002).
 * <p>
 * {@code productId}, {@code sourceLocationId}, {@code destinationLocationId}
 * are stored as UUID scalars — not @ManyToOne joins — to avoid creating
 * duplicate Product/Location domain classes owned by A.
 * <p>
 * Quantities use {@link BigDecimal}.  Never use {@code double} or {@code float}
 * for inventory quantities.
 */
@Entity
@Table(name = "operation_line")
public class OperationLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /** FK → inventory_operation.id  (R-owned) */
    @Column(name = "operation_id", nullable = false, updatable = false)
    private UUID operationId;

    /** FK → product.id  (owned by A — scalar UUID) */
    @Column(name = "product_id", nullable = false)
    private UUID productId;

    /** FK → location.id  (owned by A — scalar UUID) */
    @Column(name = "source_location_id")
    private UUID sourceLocationId;

    /** FK → location.id  (owned by A — scalar UUID) */
    @Column(name = "destination_location_id")
    private UUID destinationLocationId;

    @Column(name = "requested_qty", nullable = false, precision = 19, scale = 4)
    private BigDecimal requestedQty;

    @Column(name = "done_qty", nullable = false, precision = 19, scale = 4)
    private BigDecimal doneQty;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Managed by DB trigger. */
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private Instant updatedAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    protected OperationLine() {}

    // ── Accessors ─────────────────────────────────────────────────────────────

    public UUID getId() { return id; }

    public UUID getOperationId() { return operationId; }
    public void setOperationId(UUID operationId) { this.operationId = operationId; }

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }

    public UUID getSourceLocationId() { return sourceLocationId; }
    public void setSourceLocationId(UUID sourceLocationId) { this.sourceLocationId = sourceLocationId; }

    public UUID getDestinationLocationId() { return destinationLocationId; }
    public void setDestinationLocationId(UUID destinationLocationId) { this.destinationLocationId = destinationLocationId; }

    public BigDecimal getRequestedQty() { return requestedQty; }
    public void setRequestedQty(BigDecimal requestedQty) { this.requestedQty = requestedQty; }

    public BigDecimal getDoneQty() { return doneQty; }
    public void setDoneQty(BigDecimal doneQty) { this.doneQty = doneQty; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // ── Pre-persist ───────────────────────────────────────────────────────────

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (doneQty == null) doneQty = BigDecimal.ZERO;
        if (version == null) version = 0L;
    }
}
