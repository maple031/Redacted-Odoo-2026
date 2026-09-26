package com.stocksense.persistence;

import com.stocksense.audit.AuditLog;
import com.stocksense.audit.AuditLogRepository;
import com.stocksense.inventory.balance.InventoryBalance;
import com.stocksense.inventory.balance.InventoryBalanceRepository;
import com.stocksense.inventory.movement.StockMovement;
import com.stocksense.inventory.movement.StockMovementRepository;
import com.stocksense.inventory.reservation.Reservation;
import com.stocksense.inventory.reservation.ReservationRepository;
import com.stocksense.inventory.reservation.ReservationStatus;
import com.stocksense.operations.adjustment.AdjustmentReasonCode;
import com.stocksense.operations.adjustment.InventoryAdjustmentDetail;
import com.stocksense.operations.adjustment.InventoryAdjustmentDetailRepository;
import com.stocksense.operations.core.*;
import com.stocksense.operations.delivery.DeliveryDetail;
import com.stocksense.operations.delivery.DeliveryDetailRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for R's Phase R1 persistence layer.
 * Uses real PostgreSQL (Testcontainers) + Flyway V001-V006.
 * NO H2 / embedded database.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Transactional
class InventoryPersistenceMappingTest {

    static PostgreSQLContainer<?> postgres;

    static {
        if (System.getenv("STOCKSENSE_TEST_DB_URL") == null) {
            postgres = new PostgreSQLContainer<>("postgres:17-alpine");
            postgres.start();
        }
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        String dbUrl = System.getenv("STOCKSENSE_TEST_DB_URL");
        if (dbUrl != null) {
            registry.add("spring.datasource.url", () -> dbUrl);
            registry.add("spring.datasource.username", () -> System.getenv("SPRING_DATASOURCE_USERNAME"));
            registry.add("spring.datasource.password", () -> System.getenv("SPRING_DATASOURCE_PASSWORD"));
        } else {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
        }
    }

    @Autowired InventoryOperationRepository operationRepo;
    @Autowired OperationLineRepository lineRepo;
    @Autowired InventoryAdjustmentDetailRepository adjustmentDetailRepo;
    @Autowired DeliveryDetailRepository deliveryDetailRepo;
    @Autowired OperationSequenceRepository sequenceRepo;
    @Autowired InventoryBalanceRepository balanceRepo;
    @Autowired StockMovementRepository movementRepo;
    @Autowired ReservationRepository reservationRepo;
    @Autowired AuditLogRepository auditRepo;

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * We need real warehouse/product/location rows to satisfy FK constraints.
     * Because those entities are owned by A/J, we insert them via the
     * repositories that Hibernate manages for us through native SQL,
     * or we rely on the fact that @Transactional will roll back so we
     * directly use JdbcTemplate-free approach: persist minimal stubs.
     *
     * Since we can't use A/J-owned Java entities, we use Spring's
     * JdbcTemplate to insert the minimum required rows.
     */
    @Autowired
    org.springframework.jdbc.core.JdbcTemplate jdbc;

    private UUID insertWarehouse() {
        UUID id = UUID.randomUUID();
        jdbc.update(
            "INSERT INTO warehouse (id, short_code, name) VALUES (?, ?, ?)",
            id, "TST", "Test Warehouse"
        );
        return id;
    }

    private UUID insertProduct() {
        UUID uomId = UUID.randomUUID();
        jdbc.update(
            "INSERT INTO unit_of_measure (id, name, symbol) VALUES (?, ?, ?)",
            uomId, "Unit-" + uomId, "U"
        );
        UUID id = UUID.randomUUID();
        jdbc.update(
            "INSERT INTO product (id, sku, name, uom_id) VALUES (?, ?, ?, ?)",
            id, "SKU-" + id, "Product-" + id, uomId
        );
        return id;
    }

    private UUID insertInternalLocation(UUID warehouseId) {
        UUID id = UUID.randomUUID();
        jdbc.update(
            "INSERT INTO location (id, warehouse_id, code, name, location_type) VALUES (?, ?, ?, ?, ?)",
            id, warehouseId, "LOC-" + id, "Location-" + id, "INTERNAL"
        );
        return id;
    }

    private UUID vendorLocationId() {
        return jdbc.queryForObject(
            "SELECT id FROM location WHERE code = 'VENDOR' LIMIT 1",
            UUID.class
        );
    }

    private UUID customerLocationId() {
        return jdbc.queryForObject(
            "SELECT id FROM location WHERE code = 'CUSTOMER' LIMIT 1",
            UUID.class
        );
    }

    private InventoryOperation buildOperation(UUID warehouseId, OperationType type, UUID partnerId) {
        InventoryOperation op = new InventoryOperation();
        op.setReferenceCode(type.name() + "-" + UUID.randomUUID());
        op.setOperationType(type);
        op.setStatus(OperationStatus.DRAFT);
        op.setReferenceWarehouseId(warehouseId);
        op.setPartnerId(partnerId);
        op.setKanbanRank(1000L);
        return operationRepo.save(op);
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    @Test
    void operationPersistenceAndRetrieval() {
        UUID warehouseId = insertWarehouse();
        UUID partnerId = UUID.randomUUID();
        // partner doesn't need to exist for scalar-UUID FK tests with no DB FK check failing
        // but inventory_operation.partner_id is a real FK → business_partner.
        // Insert a real partner row:
        jdbc.update(
            "INSERT INTO business_partner (id, name, is_supplier, is_customer) VALUES (?, ?, ?, ?)",
            partnerId, "Test Supplier", true, false
        );

        InventoryOperation op = buildOperation(warehouseId, OperationType.RECEIPT, partnerId);
        operationRepo.flush();

        Optional<InventoryOperation> loaded = operationRepo.findById(op.getId());
        assertThat(loaded).isPresent();
        assertThat(loaded.get().getOperationType()).isEqualTo(OperationType.RECEIPT);
        assertThat(loaded.get().getStatus()).isEqualTo(OperationStatus.DRAFT);
        assertThat(loaded.get().getReferenceWarehouseId()).isEqualTo(warehouseId);
        assertThat(loaded.get().getVersion()).isEqualTo(0L);
    }

    @Test
    void operationLinePersistenceAndRetrieval() {
        UUID warehouseId = insertWarehouse();
        UUID productId = insertProduct();
        UUID srcLoc = vendorLocationId();
        UUID dstLoc = insertInternalLocation(warehouseId);

        UUID partnerId = UUID.randomUUID();
        jdbc.update(
            "INSERT INTO business_partner (id, name, is_supplier, is_customer) VALUES (?, ?, ?, ?)",
            partnerId, "Supplier B", true, false
        );

        InventoryOperation op = buildOperation(warehouseId, OperationType.RECEIPT, partnerId);

        OperationLine line = new OperationLine();
        line.setOperationId(op.getId());
        line.setProductId(productId);
        line.setSourceLocationId(srcLoc);
        line.setDestinationLocationId(dstLoc);
        line.setRequestedQty(new BigDecimal("10.0000"));
        OperationLine saved = lineRepo.save(line);
        lineRepo.flush();

        List<OperationLine> lines = lineRepo.findByOperationId(op.getId());
        assertThat(lines).hasSize(1);
        assertThat(lines.get(0).getRequestedQty()).isEqualByComparingTo("10.0000");
        assertThat(lines.get(0).getDoneQty()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(lines.get(0).getId()).isEqualTo(saved.getId());
    }

    @Test
    void inventoryBalanceMappingIncludingGeneratedAvailableQty() {
        UUID warehouseId = insertWarehouse();
        UUID productId = insertProduct();
        UUID locId = insertInternalLocation(warehouseId);

        balanceRepo.upsertIfMissing(productId, locId);
        balanceRepo.flush();

        Optional<InventoryBalance> bal = balanceRepo.findByProductIdAndLocationId(productId, locId);
        assertThat(bal).isPresent();
        assertThat(bal.get().getOnHandQty()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(bal.get().getReservedQty()).isEqualByComparingTo(BigDecimal.ZERO);
        // The DB-generated column is present and equals on_hand - reserved
        assertThat(bal.get().getAvailableQty()).isEqualByComparingTo(BigDecimal.ZERO);

        // Update quantities and verify generated column follows
        InventoryBalance b = bal.get();
        b.setOnHandQty(new BigDecimal("50.0000"));
        b.setReservedQty(new BigDecimal("10.0000"));
        balanceRepo.save(b);
        balanceRepo.flush();

        // Re-read to get fresh DB-computed available_qty
        InventoryBalance reloaded = balanceRepo.findById(b.getId()).orElseThrow();
        assertThat(reloaded.getAvailableQty()).isEqualByComparingTo("40.0000");
    }

    @Test
    void reservationPersistence() {
        UUID warehouseId = insertWarehouse();
        UUID productId = insertProduct();
        UUID locId = insertInternalLocation(warehouseId);
        UUID partnerId = UUID.randomUUID();
        jdbc.update(
            "INSERT INTO business_partner (id, name, is_supplier, is_customer) VALUES (?, ?, ?, ?)",
            partnerId, "Customer X", false, true
        );

        InventoryOperation op = buildOperation(warehouseId, OperationType.DELIVERY, null);
        // DELIVERY partner_id can be null per schema check

        OperationLine line = new OperationLine();
        line.setOperationId(op.getId());
        line.setProductId(productId);
        line.setSourceLocationId(locId);
        line.setDestinationLocationId(customerLocationId());
        line.setRequestedQty(new BigDecimal("5.0000"));
        OperationLine savedLine = lineRepo.save(line);

        Reservation res = new Reservation();
        res.setOperationLineId(savedLine.getId());
        res.setLocationId(locId);
        res.setQty(new BigDecimal("5.0000"));
        res.setStatus(ReservationStatus.ACTIVE);
        Reservation saved = reservationRepo.save(res);
        reservationRepo.flush();

        List<Reservation> active = reservationRepo.findByOperationLineIdAndStatus(
                savedLine.getId(), ReservationStatus.ACTIVE);
        assertThat(active).hasSize(1);
        assertThat(active.get(0).getQty()).isEqualByComparingTo("5.0000");
        assertThat(active.get(0).getStatus()).isEqualTo(ReservationStatus.ACTIVE);
        assertThat(active.get(0).getClosedAt()).isNull();
    }

    @Test
    void stockMovementPersistence() {
        UUID warehouseId = insertWarehouse();
        UUID productId = insertProduct();
        UUID dstLoc = insertInternalLocation(warehouseId);
        UUID srcLoc = vendorLocationId();
        UUID partnerId = UUID.randomUUID();
        jdbc.update(
            "INSERT INTO business_partner (id, name, is_supplier, is_customer) VALUES (?, ?, ?, ?)",
            partnerId, "Supplier M", true, false
        );

        InventoryOperation op = buildOperation(warehouseId, OperationType.RECEIPT, partnerId);
        OperationLine line = new OperationLine();
        line.setOperationId(op.getId());
        line.setProductId(productId);
        line.setSourceLocationId(srcLoc);
        line.setDestinationLocationId(dstLoc);
        line.setRequestedQty(new BigDecimal("20.0000"));
        OperationLine savedLine = lineRepo.save(line);

        StockMovement mv = new StockMovement();
        mv.setOperationLineId(savedLine.getId());
        mv.setProductId(productId);
        mv.setSourceLocationId(srcLoc);
        mv.setDestinationLocationId(dstLoc);
        mv.setQty(new BigDecimal("20.0000"));
        mv.setMovedAt(Instant.now());
        StockMovement saved = movementRepo.save(mv);
        movementRepo.flush();

        List<StockMovement> moves = movementRepo.findByOperationLineId(savedLine.getId());
        assertThat(moves).hasSize(1);
        assertThat(moves.get(0).getQty()).isEqualByComparingTo("20.0000");
        assertThat(moves.get(0).getReversalOfMovementId()).isNull();
    }

    @Test
    void operationSequencePersistence() {
        UUID warehouseId = insertWarehouse();

        OperationSequence seq = new OperationSequence();
        seq.setWarehouseId(warehouseId);
        seq.setOperationType(OperationType.RECEIPT);
        seq.setNextValue(1L);
        OperationSequence saved = sequenceRepo.save(seq);
        sequenceRepo.flush();

        Optional<OperationSequence> loaded = sequenceRepo
                .findByWarehouseIdAndOperationType(warehouseId, OperationType.RECEIPT);
        assertThat(loaded).isPresent();
        assertThat(loaded.get().getNextValue()).isEqualTo(1L);
        assertThat(loaded.get().getId()).isEqualTo(saved.getId());
    }

    @Test
    void adjustmentDetailPersistence() {
        UUID warehouseId = insertWarehouse();
        UUID productId = insertProduct();
        UUID locId = insertInternalLocation(warehouseId);

        InventoryOperation op = buildOperation(warehouseId, OperationType.ADJUSTMENT, null);

        OperationLine line = new OperationLine();
        line.setOperationId(op.getId());
        line.setProductId(productId);
        line.setDestinationLocationId(locId);
        line.setRequestedQty(new BigDecimal("100.0000"));
        OperationLine savedLine = lineRepo.save(line);

        InventoryAdjustmentDetail detail = new InventoryAdjustmentDetail();
        detail.setOperationLineId(savedLine.getId());
        detail.setLocationId(locId);
        detail.setSystemQty(new BigDecimal("80.0000"));
        detail.setCountedQty(new BigDecimal("100.0000"));
        detail.setReasonCode(AdjustmentReasonCode.PHYSICAL_COUNT);
        detail.setCountedAt(Instant.now());
        adjustmentDetailRepo.save(detail);
        adjustmentDetailRepo.flush();

        Optional<InventoryAdjustmentDetail> loaded =
                adjustmentDetailRepo.findByOperationLineId(savedLine.getId());
        assertThat(loaded).isPresent();
        assertThat(loaded.get().getSystemQty()).isEqualByComparingTo("80.0000");
        assertThat(loaded.get().getCountedQty()).isEqualByComparingTo("100.0000");
        assertThat(loaded.get().getReasonCode()).isEqualTo(AdjustmentReasonCode.PHYSICAL_COUNT);
    }

    @Test
    void deliveryDetailPersistence() {
        UUID warehouseId = insertWarehouse();

        InventoryOperation op = buildOperation(warehouseId, OperationType.DELIVERY, null);

        DeliveryDetail dd = new DeliveryDetail();
        dd.setOperationId(op.getId());
        dd.setDeliveryAddress("123 Test Street, Test City");
        deliveryDetailRepo.save(dd);
        deliveryDetailRepo.flush();

        Optional<DeliveryDetail> loaded = deliveryDetailRepo.findByOperationId(op.getId());
        assertThat(loaded).isPresent();
        assertThat(loaded.get().getDeliveryAddress()).isEqualTo("123 Test Street, Test City");
    }

    @Test
    void auditLogPersistence() {
        UUID operationId = UUID.randomUUID();

        AuditLog log = new AuditLog();
        log.setEntityType("inventory_operation");
        log.setEntityId(operationId);
        log.setAction("STATUS_CHANGED");
        log.setAfterState("{\"status\":\"DONE\"}");
        log.setReason("Posting complete");
        auditRepo.save(log);
        auditRepo.flush();

        List<AuditLog> entries = auditRepo.findByEntityTypeAndEntityId(
                "inventory_operation", operationId);
        assertThat(entries).hasSize(1);
        assertThat(entries.get(0).getAction()).isEqualTo("STATUS_CHANGED");
        assertThat(entries.get(0).getAfterState()).contains("DONE");
        // Verify no before_state for this entry (it was null)
        assertThat(entries.get(0).getBeforeState()).isNull();
    }

    @Test
    void forUpdateLockOnInventoryBalance() {
        UUID warehouseId = insertWarehouse();
        UUID productId = insertProduct();
        UUID locId = insertInternalLocation(warehouseId);

        balanceRepo.upsertIfMissing(productId, locId);
        balanceRepo.flush();

        // Should not throw — verifies the JPQL lock query compiles and runs
        Optional<InventoryBalance> locked = balanceRepo
                .findByProductIdAndLocationIdForUpdate(productId, locId);
        assertThat(locked).isPresent();
    }

    @Test
    void forUpdateLockOnOperation() {
        UUID warehouseId = insertWarehouse();
        UUID partnerId = UUID.randomUUID();
        jdbc.update(
            "INSERT INTO business_partner (id, name, is_supplier, is_customer) VALUES (?, ?, ?, ?)",
            partnerId, "Supplier FU", true, false
        );
        InventoryOperation op = buildOperation(warehouseId, OperationType.RECEIPT, partnerId);
        operationRepo.flush();

        Optional<InventoryOperation> locked = operationRepo.findByIdForUpdate(op.getId());
        assertThat(locked).isPresent();
    }

    @Test
    void forUpdateLockOnOperationSequence() {
        UUID warehouseId = insertWarehouse();

        OperationSequence seq = new OperationSequence();
        seq.setWarehouseId(warehouseId);
        seq.setOperationType(OperationType.DELIVERY);
        seq.setNextValue(1L);
        sequenceRepo.save(seq);
        sequenceRepo.flush();

        Optional<OperationSequence> locked = sequenceRepo
                .findByWarehouseIdAndOperationTypeForUpdate(warehouseId, OperationType.DELIVERY);
        assertThat(locked).isPresent();
        assertThat(locked.get().getNextValue()).isEqualTo(1L);
    }

    @Test
    void forUpdateLockOnActiveReservation() {
        UUID warehouseId = insertWarehouse();
        UUID productId = insertProduct();
        UUID locId = insertInternalLocation(warehouseId);

        InventoryOperation op = buildOperation(warehouseId, OperationType.DELIVERY, null);
        OperationLine line = new OperationLine();
        line.setOperationId(op.getId());
        line.setProductId(productId);
        line.setSourceLocationId(locId);
        line.setDestinationLocationId(customerLocationId());
        line.setRequestedQty(new BigDecimal("3.0000"));
        OperationLine savedLine = lineRepo.save(line);

        Reservation res = new Reservation();
        res.setOperationLineId(savedLine.getId());
        res.setLocationId(locId);
        res.setQty(new BigDecimal("3.0000"));
        res.setStatus(ReservationStatus.ACTIVE);
        reservationRepo.save(res);
        reservationRepo.flush();

        List<Reservation> locked = reservationRepo
                .findActiveByOperationLineIdForUpdate(savedLine.getId());
        assertThat(locked).hasSize(1);
    }
}
