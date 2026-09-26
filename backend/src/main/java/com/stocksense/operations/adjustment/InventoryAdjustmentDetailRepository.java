package com.stocksense.operations.adjustment;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link InventoryAdjustmentDetail}.
 */
public interface InventoryAdjustmentDetailRepository extends JpaRepository<InventoryAdjustmentDetail, UUID> {

    Optional<InventoryAdjustmentDetail> findByOperationLineId(UUID operationLineId);

    /**
     * Load all adjustment details for a set of operation-line IDs, locked
     * for update.  Used by the posting engine.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM InventoryAdjustmentDetail d WHERE d.operationLineId IN :lineIds")
    List<InventoryAdjustmentDetail> findByOperationLineIdInForUpdate(
            @Param("lineIds") List<UUID> lineIds);
}
