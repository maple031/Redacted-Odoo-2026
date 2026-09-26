package com.stocksense.operations.core;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link OperationLine}.
 */
public interface OperationLineRepository extends JpaRepository<OperationLine, UUID> {

    List<OperationLine> findByOperationId(UUID operationId);

    /**
     * Load all lines for an operation with a pessimistic write lock — used by
     * the posting engine when it needs to update {@code done_qty}.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM OperationLine l WHERE l.operationId = :operationId")
    List<OperationLine> findByOperationIdForUpdate(@Param("operationId") UUID operationId);

    /**
     * Load a single line with pessimistic write lock.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM OperationLine l WHERE l.id = :id")
    Optional<OperationLine> findByIdForUpdate(@Param("id") UUID id);
}
