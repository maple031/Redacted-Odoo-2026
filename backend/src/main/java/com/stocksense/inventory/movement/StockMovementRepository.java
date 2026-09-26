package com.stocksense.inventory.movement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * Repository for {@link StockMovement}.
 * <p>
 * Only INSERT and SELECT operations are exposed.
 * Stock movements must never be updated or deleted by application code.
 */
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    List<StockMovement> findByOperationLineId(UUID operationLineId);

    List<StockMovement> findByProductIdOrderByMovedAtDesc(UUID productId);

    @Query("SELECT m FROM StockMovement m WHERE m.operationLineId IN :lineIds ORDER BY m.movedAt DESC")
    List<StockMovement> findByOperationLineIdIn(@Param("lineIds") List<UUID> lineIds);
}
