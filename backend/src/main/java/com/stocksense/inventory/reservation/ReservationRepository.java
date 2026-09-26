package com.stocksense.inventory.reservation;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * Repository for {@link Reservation}.
 * <p>
 * The partial indexes {@code reservation_active_operation_line_idx} and
 * {@code reservation_active_location_idx} in V002 improve query performance
 * for ACTIVE-status lookups.
 */
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    List<Reservation> findByOperationLineIdAndStatus(UUID operationLineId, ReservationStatus status);

    List<Reservation> findByLocationIdAndStatus(UUID locationId, ReservationStatus status);

    /**
     * Load ACTIVE reservations for an operation line with a pessimistic write
     * lock — used by the posting engine when consuming or releasing reservations.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.operationLineId = :operationLineId AND r.status = 'ACTIVE'")
    List<Reservation> findActiveByOperationLineIdForUpdate(
            @Param("operationLineId") UUID operationLineId);

    /**
     * Load ACTIVE reservations for a location with a pessimistic write lock.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.locationId = :locationId AND r.status = 'ACTIVE'")
    List<Reservation> findActiveByLocationIdForUpdate(
            @Param("locationId") UUID locationId);
}
