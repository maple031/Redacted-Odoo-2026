package com.stocksense.inventory.posting;

import com.stocksense.inventory.balance.InventoryBalance;
import com.stocksense.inventory.balance.InventoryBalanceRepository;
import com.stocksense.inventory.movement.StockMovement;
import com.stocksense.inventory.movement.StockMovementRepository;
import com.stocksense.inventory.reservation.Reservation;
import com.stocksense.inventory.reservation.ReservationRepository;
import com.stocksense.inventory.reservation.ReservationStatus;
import com.stocksense.operations.core.InventoryOperation;
import com.stocksense.operations.core.OperationLine;
import com.stocksense.operations.core.OperationStatus;
import com.stocksense.operations.core.OperationType;
import com.stocksense.operations.core.OperationTransitionGuard;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.EmptyResultDataAccessException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Core transactional engine for posting inventory operations.
 * <p>
 * Evaluates done quantities, updates inventory balances, consumes reservations,
 * and records immutable stock movements.
 */
@Service
public class PostingService {

    private final InventoryBalanceRepository balanceRepository;
    private final StockMovementRepository movementRepository;
    private final ReservationRepository reservationRepository;
    private final OperationTransitionGuard transitionGuard;
    private final JdbcTemplate jdbcTemplate;

    public PostingService(InventoryBalanceRepository balanceRepository,
                          StockMovementRepository movementRepository,
                          ReservationRepository reservationRepository,
                          OperationTransitionGuard transitionGuard,
                          JdbcTemplate jdbcTemplate) {
        this.balanceRepository = balanceRepository;
        this.movementRepository = movementRepository;
        this.reservationRepository = reservationRepository;
        this.transitionGuard = transitionGuard;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Posts the operation, mutating stock balances and creating stock movements.
     *
     * @param operation     the operation to post
     * @param lines         the lines belonging to the operation
     * @param currentUserId the ID of the user executing the post
     */
    @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public void postOperation(InventoryOperation operation, List<OperationLine> lines, UUID currentUserId) {
        transitionGuard.validateTransition(operation.getStatus(), OperationStatus.DONE);
        operation.setStatus(OperationStatus.DONE);
        
        for (OperationLine line : lines) {
            BigDecimal qty = line.getDoneQty();
            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                continue; // Nothing to post for this line
            }

            UUID productId = line.getProductId();
            UUID srcLocationId = line.getSourceLocationId();
            UUID destLocationId = line.getDestinationLocationId();

            // 1. Process Source Location (Deduction & Reservation Consumption)
            if (srcLocationId != null && isInternalLocation(srcLocationId)) {
                balanceRepository.upsertIfMissing(productId, srcLocationId);
                InventoryBalance srcBalance = balanceRepository.findByProductIdAndLocationIdForUpdate(productId, srcLocationId)
                        .orElseThrow(() -> new IllegalStateException("Missing source balance"));

                // Consume/Release all active reservations for this line
                List<Reservation> activeReservations = reservationRepository.findActiveByOperationLineIdForUpdate(line.getId());
                BigDecimal totalReservedForLine = BigDecimal.ZERO;
                for (Reservation res : activeReservations) {
                    res.setStatus(ReservationStatus.CONSUMED);
                    res.setClosedAt(Instant.now());
                    reservationRepository.save(res);
                    totalReservedForLine = totalReservedForLine.add(res.getQty());
                }

                // Deduct onHand and reservedQty
                srcBalance.setOnHandQty(srcBalance.getOnHandQty().subtract(qty));
                BigDecimal newReservedQty = srcBalance.getReservedQty().subtract(totalReservedForLine);
                if (newReservedQty.compareTo(BigDecimal.ZERO) < 0) {
                    newReservedQty = BigDecimal.ZERO; // Safe-guard against negative reservation
                }
                srcBalance.setReservedQty(newReservedQty);
                
                // Verify we don't go negative on available stock for outbound/internal moves
                if (operation.getOperationType() == OperationType.DELIVERY || operation.getOperationType() == OperationType.TRANSFER) {
                    if (srcBalance.getOnHandQty().subtract(srcBalance.getReservedQty()).compareTo(BigDecimal.ZERO) < 0) {
                        throw new IllegalStateException("Insufficient stock at source location to post line " + line.getId());
                    }
                }
                balanceRepository.save(srcBalance);
            }

            // 2. Process Destination Location (Addition)
            if (destLocationId != null && isInternalLocation(destLocationId)) {
                balanceRepository.upsertIfMissing(productId, destLocationId);
                InventoryBalance destBalance = balanceRepository.findByProductIdAndLocationIdForUpdate(productId, destLocationId)
                        .orElseThrow(() -> new IllegalStateException("Missing destination balance"));

                destBalance.setOnHandQty(destBalance.getOnHandQty().add(qty));
                balanceRepository.save(destBalance);
            }

            // 3. Record immutable Stock Movement
            StockMovement movement = new StockMovement();
            movement.setOperationLineId(line.getId());
            movement.setProductId(productId);
            // StockMovement allows null src/dest for global receipts/adjustments if needed
            if (srcLocationId != null) movement.setSourceLocationId(srcLocationId);
            if (destLocationId != null) movement.setDestinationLocationId(destLocationId);
            movement.setQty(qty);
            movement.setCreatedByUserId(currentUserId);
            movementRepository.save(movement);
        }
    }

    private boolean isInternalLocation(UUID locationId) {
        try {
            String locationType = jdbcTemplate.queryForObject(
                    "SELECT location_type FROM location WHERE id = ?",
                    String.class,
                    locationId
            );
            return "INTERNAL".equals(locationType);
        } catch (EmptyResultDataAccessException e) {
            return false;
        }
    }
}
