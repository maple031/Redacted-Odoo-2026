package com.stocksense.inventory.reservation;

import com.stocksense.inventory.balance.InventoryBalance;
import com.stocksense.inventory.balance.InventoryBalanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing stock reservations.
 */
@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final InventoryBalanceRepository balanceRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              InventoryBalanceRepository balanceRepository) {
        this.reservationRepository = reservationRepository;
        this.balanceRepository = balanceRepository;
    }

    /**
     * Attempts to reserve stock for a specific operation line.
     *
     * @param operationLineId the operation line ID
     * @param productId       the product ID
     * @param locationId      the location ID
     * @param qty             the quantity to reserve
     * @throws IllegalStateException if there is insufficient available stock
     */
    @Transactional
    public void reserve(UUID operationLineId, UUID productId, UUID locationId, BigDecimal qty) {
        if (qty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Reservation quantity must be positive");
        }

        // 1. Ensure balance row exists
        balanceRepository.upsertIfMissing(productId, locationId);

        // 2. Lock the balance row
        InventoryBalance balance = balanceRepository.findByProductIdAndLocationIdForUpdate(productId, locationId)
                .orElseThrow(() -> new IllegalStateException("Balance missing after upsert"));

        // 3. Verify availability (onHand - reserved)
        BigDecimal available = balance.getOnHandQty().subtract(balance.getReservedQty());
        if (available.compareTo(qty) < 0) {
            throw new IllegalStateException("Insufficient available stock for reservation");
        }

        // 4. Increment reserved_qty on balance
        balance.setReservedQty(balance.getReservedQty().add(qty));
        balanceRepository.save(balance);

        // 5. Create reservation record
        Reservation reservation = new Reservation();
        reservation.setOperationLineId(operationLineId);
        reservation.setLocationId(locationId);
        reservation.setQty(qty);
        reservation.setStatus(ReservationStatus.ACTIVE);
        reservationRepository.save(reservation);
    }

    /**
     * Releases active reservations for an operation line.
     *
     * @param operationLineId the operation line ID
     * @param productId       the product ID
     */
    @Transactional
    public void releaseAllForLine(UUID operationLineId, UUID productId) {
        List<Reservation> activeReservations = reservationRepository.findActiveByOperationLineIdForUpdate(operationLineId);
        
        for (Reservation res : activeReservations) {
            // Lock balance
            balanceRepository.upsertIfMissing(productId, res.getLocationId());
            InventoryBalance balance = balanceRepository.findByProductIdAndLocationIdForUpdate(productId, res.getLocationId())
                    .orElseThrow(() -> new IllegalStateException("Balance missing"));
            
            // Decrement reserved_qty
            BigDecimal newReserved = balance.getReservedQty().subtract(res.getQty());
            if (newReserved.compareTo(BigDecimal.ZERO) < 0) {
                newReserved = BigDecimal.ZERO; // safeguard against negative reserved qty
            }
            balance.setReservedQty(newReserved);
            balanceRepository.save(balance);
            
            // Mark reservation as released
            res.setStatus(ReservationStatus.RELEASED);
            res.setClosedAt(Instant.now());
            reservationRepository.save(res);
        }
    }
}
