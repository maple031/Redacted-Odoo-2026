package com.stocksense.operations.adjustment;

/**
 * Matches the database CHECK constraint in V002:
 * reason_code IN ('PHYSICAL_COUNT', 'DAMAGE', 'LOSS', 'FOUND', 'INITIAL_STOCK', 'CORRECTION')
 */
public enum AdjustmentReasonCode {
    PHYSICAL_COUNT,
    DAMAGE,
    LOSS,
    FOUND,
    INITIAL_STOCK,
    CORRECTION
}
