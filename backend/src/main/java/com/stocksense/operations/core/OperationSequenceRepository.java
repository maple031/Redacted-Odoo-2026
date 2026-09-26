package com.stocksense.operations.core;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link OperationSequence}.
 * <p>
 * The {@link #findByWarehouseIdAndOperationTypeForUpdate} method locks the row
 * with {@code SELECT ... FOR UPDATE} so that concurrent callers cannot read the
 * same {@code next_value} simultaneously.
 */
public interface OperationSequenceRepository extends JpaRepository<OperationSequence, UUID> {

    Optional<OperationSequence> findByWarehouseIdAndOperationType(
            UUID warehouseId, OperationType operationType);

    /**
     * Pessimistic write lock — MUST be called inside an active transaction
     * before reading {@code nextValue} for allocation.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM OperationSequence s " +
           "WHERE s.warehouseId = :warehouseId AND s.operationType = :operationType")
    Optional<OperationSequence> findByWarehouseIdAndOperationTypeForUpdate(
            @Param("warehouseId") UUID warehouseId,
            @Param("operationType") OperationType operationType);
}
