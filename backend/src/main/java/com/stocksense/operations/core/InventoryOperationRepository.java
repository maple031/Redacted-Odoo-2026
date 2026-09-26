package com.stocksense.operations.core;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link InventoryOperation}.
 * Provides standard CRUD plus an explicit pessimistic-write lock variant
 * needed by the Phase R2 posting engine.
 */
public interface InventoryOperationRepository extends JpaRepository<InventoryOperation, UUID> {

    Optional<InventoryOperation> findByReferenceCode(String referenceCode);

    /**
     * Lock the operation row with {@code SELECT ... FOR UPDATE} before the
     * posting engine reads its status.  This prevents two concurrent callers
     * from both observing READY and both proceeding to post.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM InventoryOperation o WHERE o.id = :id")
    Optional<InventoryOperation> findByIdForUpdate(@Param("id") UUID id);
}
