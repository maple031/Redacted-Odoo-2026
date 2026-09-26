package com.stocksense.operations.core;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service responsible for generating sequential reference numbers for inventory operations.
 * <p>
 * This service executes in a REQUIRES_NEW transaction to ensure that sequence increments
 * are not rolled back if the main operation transaction fails (e.g., due to a validation
 * error). This prevents sequence gaps.
 */
@Service
public class ReferenceNumberService {

    private final OperationSequenceRepository sequenceRepository;
    private final JdbcTemplate jdbcTemplate;

    public ReferenceNumberService(OperationSequenceRepository sequenceRepository,
                                  JdbcTemplate jdbcTemplate) {
        this.sequenceRepository = sequenceRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Generates a new reference number for the given warehouse and operation type.
     * <p>
     * Format: {@code [WAREHOUSE_SHORT_CODE]/[OPERATION_TYPE]/[SEQUENCE_VALUE]}
     * <br>
     * Example: {@code WH/RECEIPT/00005}
     *
     * @param warehouseId   the ID of the warehouse (FK to A's domain)
     * @param operationType the type of operation
     * @return the generated reference code
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateReferenceNumber(UUID warehouseId, OperationType operationType) {
        OperationSequence sequence = sequenceRepository
                .findByWarehouseIdAndOperationTypeForUpdate(warehouseId, operationType)
                .orElseGet(() -> {
                    OperationSequence newSeq = new OperationSequence();
                    newSeq.setWarehouseId(warehouseId);
                    newSeq.setOperationType(operationType);
                    newSeq.setNextValue(1L);
                    return sequenceRepository.save(newSeq);
                });

        long currentVal = sequence.getNextValue();
        sequence.setNextValue(currentVal + 1);
        sequenceRepository.saveAndFlush(sequence); // flush to DB

        String warehouseCode = fetchWarehouseShortCode(warehouseId);
        
        return String.format("%s/%s/%05d",
                warehouseCode,
                operationType.name(),
                currentVal);
    }

    /**
     * Look up the warehouse short code without creating a cross-module JPA entity dependency.
     */
    private String fetchWarehouseShortCode(UUID warehouseId) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT short_code FROM warehouse WHERE id = ?",
                    String.class,
                    warehouseId
            );
        } catch (Exception e) {
            // Fallback if warehouse is not found (though FK should guarantee it)
            // or if the query fails.
            return "WH";
        }
    }
}
