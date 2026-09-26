package com.stocksense.inventory.balance;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link InventoryBalance}.
 * <p>
 * The posting engine must:
 * <ol>
 *   <li>Attempt an upsert (INSERT ON CONFLICT DO NOTHING) to ensure the row exists.</li>
 *   <li>Immediately load the row with {@link #findByProductIdAndLocationIdForUpdate}
 *       to obtain a pessimistic write lock before mutating quantities.</li>
 * </ol>
 * This pattern prevents race conditions when two concurrent calls both encounter
 * a missing balance row for the same (product, location) pair.
 */
public interface InventoryBalanceRepository extends JpaRepository<InventoryBalance, UUID> {

    Optional<InventoryBalance> findByProductIdAndLocationId(UUID productId, UUID locationId);

    /**
     * Pessimistic write lock — SELECT ... FOR UPDATE.
     * Always call this after the upsert-if-missing step.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM InventoryBalance b " +
           "WHERE b.productId = :productId AND b.locationId = :locationId")
    Optional<InventoryBalance> findByProductIdAndLocationIdForUpdate(
            @Param("productId") UUID productId,
            @Param("locationId") UUID locationId);

    /**
     * INSERT ... ON CONFLICT (product_id, location_id) DO NOTHING.
     * Ensures the balance row exists before locking it.
     * Must be called within the same transaction as the subsequent lock.
     */
    @Modifying
    @Query(value = """
            INSERT INTO inventory_balance (product_id, location_id, on_hand_qty, reserved_qty, version)
            VALUES (:productId, :locationId, 0, 0, 0)
            ON CONFLICT (product_id, location_id) DO NOTHING
            """, nativeQuery = true)
    void upsertIfMissing(@Param("productId") UUID productId,
                         @Param("locationId") UUID locationId);
}
