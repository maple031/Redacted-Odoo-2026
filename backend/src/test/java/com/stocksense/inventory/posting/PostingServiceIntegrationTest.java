package com.stocksense.inventory.posting;

import com.stocksense.inventory.balance.InventoryBalance;
import com.stocksense.inventory.balance.InventoryBalanceRepository;
import com.stocksense.inventory.movement.StockMovement;
import com.stocksense.inventory.movement.StockMovementRepository;
import com.stocksense.inventory.reservation.Reservation;
import com.stocksense.inventory.reservation.ReservationRepository;
import com.stocksense.inventory.reservation.ReservationStatus;
import com.stocksense.operations.core.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Transactional
class PostingServiceIntegrationTest {

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

    @Autowired PostingService postingService;
    @Autowired InventoryOperationRepository operationRepo;
    @Autowired OperationLineRepository lineRepo;
    @Autowired InventoryBalanceRepository balanceRepo;
    @Autowired StockMovementRepository movementRepo;
    @Autowired ReservationRepository reservationRepo;
    @Autowired JdbcTemplate jdbc;

    private UUID warehouseId;
    private UUID productId;
    private UUID internalLoc;
    private UUID internalLoc2;
    private UUID vendorLoc;
    private UUID customerLoc;
    private UUID currentUserId = UUID.randomUUID();
    private UUID partnerId;

    @BeforeEach
    void setup() {
        insertAppUser(currentUserId);
        partnerId = insertBusinessPartner();
        warehouseId = insertWarehouse();
        productId = insertProduct();
        internalLoc = insertInternalLocation(warehouseId);
        internalLoc2 = insertInternalLocation(warehouseId);
        vendorLoc = vendorLocationId();
        customerLoc = customerLocationId();
    }

    @Test
    void readyReceiptPostsSuccessfully() {
        // 1. READY receipt posts successfully
        // 2. receipt destination balance increases
        // 3. receipt movement created
        InventoryOperation op = buildOperation(OperationType.RECEIPT, OperationStatus.READY);
        OperationLine line = buildLine(op.getId(), vendorLoc, internalLoc, new BigDecimal("10.0000"));

        postingService.postOperation(op, List.of(line), currentUserId);
        
        assertThat(op.getStatus()).isEqualTo(OperationStatus.DONE);

        Optional<InventoryBalance> destBal = balanceRepo.findByProductIdAndLocationId(productId, internalLoc);
        assertThat(destBal).isPresent();
        assertThat(destBal.get().getOnHandQty()).isEqualByComparingTo("10.0000");

        List<StockMovement> moves = movementRepo.findByOperationLineId(line.getId());
        assertThat(moves).hasSize(1);
        assertThat(moves.get(0).getQty()).isEqualByComparingTo("10.0000");
    }

    @Test
    void draftReceiptCannotBePosted() {
        // 4. DRAFT receipt cannot be posted
        InventoryOperation op = buildOperation(OperationType.RECEIPT, OperationStatus.DRAFT);
        OperationLine line = buildLine(op.getId(), vendorLoc, internalLoc, new BigDecimal("10.0000"));

        assertThrows(IllegalStateException.class, () -> 
            postingService.postOperation(op, List.of(line), currentUserId)
        );
    }

    @Test
    void readyDeliveryPostsSuccessfully() {
        // 5. READY delivery posts successfully
        // 6. delivery source balance decreases
        // 7. delivery movement created
        InventoryOperation op = buildOperation(OperationType.DELIVERY, OperationStatus.READY);
        OperationLine line = buildLine(op.getId(), internalLoc, customerLoc, new BigDecimal("5.0000"));

        // Pre-fill stock
        balanceRepo.upsertIfMissing(productId, internalLoc);
        InventoryBalance bal = balanceRepo.findByProductIdAndLocationId(productId, internalLoc).orElseThrow();
        bal.setOnHandQty(new BigDecimal("10.0000"));
        balanceRepo.save(bal);

        // Pre-reserve
        createReservation(line.getId(), internalLoc, new BigDecimal("5.0000"));

        postingService.postOperation(op, List.of(line), currentUserId);

        assertThat(op.getStatus()).isEqualTo(OperationStatus.DONE);

        InventoryBalance updatedBal = balanceRepo.findByProductIdAndLocationId(productId, internalLoc).orElseThrow();
        assertThat(updatedBal.getOnHandQty()).isEqualByComparingTo("5.0000"); // 10 - 5
        assertThat(updatedBal.getReservedQty()).isEqualByComparingTo("0.0000");

        List<StockMovement> moves = movementRepo.findByOperationLineId(line.getId());
        assertThat(moves).hasSize(1);
        assertThat(moves.get(0).getQty()).isEqualByComparingTo("5.0000");
    }

    @Test
    void readyTransferPostsSuccessfully() {
        // 8. READY transfer posts successfully
        // 9. transfer source balance decreases
        // 10. transfer destination balance increases
        // 11. transfer movement created
        InventoryOperation op = buildOperation(OperationType.TRANSFER, OperationStatus.READY);
        OperationLine line = buildLine(op.getId(), internalLoc, internalLoc2, new BigDecimal("5.0000"));

        // Pre-fill stock
        balanceRepo.upsertIfMissing(productId, internalLoc);
        InventoryBalance srcBal = balanceRepo.findByProductIdAndLocationId(productId, internalLoc).orElseThrow();
        srcBal.setOnHandQty(new BigDecimal("10.0000"));
        balanceRepo.save(srcBal);

        // Pre-reserve
        createReservation(line.getId(), internalLoc, new BigDecimal("5.0000"));

        postingService.postOperation(op, List.of(line), currentUserId);

        InventoryBalance updatedSrc = balanceRepo.findByProductIdAndLocationId(productId, internalLoc).orElseThrow();
        assertThat(updatedSrc.getOnHandQty()).isEqualByComparingTo("5.0000");

        Optional<InventoryBalance> updatedDst = balanceRepo.findByProductIdAndLocationId(productId, internalLoc2);
        assertThat(updatedDst).isPresent();
        assertThat(updatedDst.get().getOnHandQty()).isEqualByComparingTo("5.0000");

        List<StockMovement> moves = movementRepo.findByOperationLineId(line.getId());
        assertThat(moves).hasSize(1);
    }

    @Test
    void readyAdjustmentPostsSuccessfully() {
        // 12. READY adjustment posts successfully
        // 13. adjustment balance updates appropriately
        InventoryOperation op = buildOperation(OperationType.ADJUSTMENT, OperationStatus.READY);
        // Adjustment changes from 10 to 15 (difference of +5)
        OperationLine line = buildLine(op.getId(), vendorLoc, internalLoc, new BigDecimal("5.0000"));

        balanceRepo.upsertIfMissing(productId, internalLoc);
        InventoryBalance bal = balanceRepo.findByProductIdAndLocationId(productId, internalLoc).orElseThrow();
        bal.setOnHandQty(new BigDecimal("10.0000"));
        balanceRepo.save(bal);

        postingService.postOperation(op, List.of(line), currentUserId);

        InventoryBalance updatedBal = balanceRepo.findByProductIdAndLocationId(productId, internalLoc).orElseThrow();
        assertThat(updatedBal.getOnHandQty()).isEqualByComparingTo("15.0000"); // 10 + 5
    }

    @Test
    void postingWithoutReservationFailsIfInsufficientStock() {
        // 14. posting without reservation fails if insufficient stock
        InventoryOperation op = buildOperation(OperationType.DELIVERY, OperationStatus.READY);
        OperationLine line = buildLine(op.getId(), internalLoc, customerLoc, new BigDecimal("15.0000"));

        // Stock has 10, but we need 15 and we don't have enough reservations
        balanceRepo.upsertIfMissing(productId, internalLoc);
        InventoryBalance bal = balanceRepo.findByProductIdAndLocationId(productId, internalLoc).orElseThrow();
        bal.setOnHandQty(new BigDecimal("10.0000"));
        balanceRepo.save(bal);

        // Expect Exception because 10 - 15 = -5 which violates stock non-negative
        assertThrows(IllegalStateException.class, () -> 
            postingService.postOperation(op, List.of(line), currentUserId)
        );
    }

    private void createReservation(UUID lineId, UUID locId, BigDecimal qty) {
        Reservation res = new Reservation();
        res.setOperationLineId(lineId);
        res.setLocationId(locId);
        res.setQty(qty);
        res.setStatus(ReservationStatus.ACTIVE);
        reservationRepo.save(res);
    }

    private InventoryOperation buildOperation(OperationType type, OperationStatus status) {
        InventoryOperation op = new InventoryOperation();
        op.setReferenceCode(type.name() + "-" + UUID.randomUUID());
        op.setOperationType(type);
        op.setStatus(status);
        op.setReferenceWarehouseId(warehouseId);
        op.setKanbanRank(1000L);
        if (type == OperationType.RECEIPT || type == OperationType.DELIVERY) {
            op.setPartnerId(partnerId);
        }
        return operationRepo.save(op);
    }

    private void insertAppUser(UUID id) {
        jdbc.update("INSERT INTO app_user (id, login_id, email, password_hash) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING", 
            id, "testuser", id + "@test.com", "hash");
    }

    private UUID insertBusinessPartner() {
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO business_partner (id, name, is_supplier) VALUES (?, ?, ?)", 
            id, "Test Partner", true);
        return id;
    }

    private OperationLine buildLine(UUID opId, UUID src, UUID dst, BigDecimal qty) {
        OperationLine line = new OperationLine();
        line.setOperationId(opId);
        line.setProductId(productId);
        line.setSourceLocationId(src);
        line.setDestinationLocationId(dst);
        line.setRequestedQty(qty);
        line.setDoneQty(qty);
        return lineRepo.save(line);
    }

    private UUID insertWarehouse() {
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO warehouse (id, short_code, name) VALUES (?, ?, ?)", id, "TST", "Test");
        return id;
    }

    private UUID insertProduct() {
        UUID uomId = UUID.randomUUID();
        jdbc.update("INSERT INTO unit_of_measure (id, name, symbol) VALUES (?, ?, ?)", uomId, "Unit", "U");
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO product (id, sku, name, uom_id) VALUES (?, ?, ?, ?)", id, "SKU", "Prod", uomId);
        return id;
    }

    private UUID insertInternalLocation(UUID wId) {
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO location (id, warehouse_id, code, name, location_type) VALUES (?, ?, ?, ?, ?)",
            id, wId, "LOC-" + id, "Loc", "INTERNAL");
        return id;
    }

    private UUID vendorLocationId() {
        return jdbc.queryForObject("SELECT id FROM location WHERE code = 'VENDOR' LIMIT 1", UUID.class);
    }

    private UUID customerLocationId() {
        return jdbc.queryForObject("SELECT id FROM location WHERE code = 'CUSTOMER' LIMIT 1", UUID.class);
    }
}
