package com.stocksense.operations.delivery;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link DeliveryDetail}.
 */
public interface DeliveryDetailRepository extends JpaRepository<DeliveryDetail, UUID> {

    Optional<DeliveryDetail> findByOperationId(UUID operationId);
}
