package com.stocksense.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * Repository for {@link AuditLog}.
 * <p>
 * No update or delete methods are exposed — audit log is append-only.
 * The composite index {@code audit_log_entity_created_at_idx}
 * ({@code entity_type, entity_id, created_at DESC}) in V002 supports
 * the primary query pattern used here.
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    @Query("SELECT a FROM AuditLog a " +
           "WHERE a.entityType = :entityType AND a.entityId = :entityId " +
           "ORDER BY a.createdAt DESC")
    List<AuditLog> findByEntityTypeAndEntityId(
            @Param("entityType") String entityType,
            @Param("entityId") UUID entityId);
}
