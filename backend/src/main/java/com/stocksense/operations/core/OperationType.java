package com.stocksense.operations.core;

/**
 * Matches the database CHECK constraint in V002:
 * operation_type IN ('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT')
 */
public enum OperationType {
    RECEIPT,
    DELIVERY,
    TRANSFER,
    ADJUSTMENT
}
