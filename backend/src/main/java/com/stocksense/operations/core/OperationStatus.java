package com.stocksense.operations.core;

/**
 * Matches the database CHECK constraint in V002:
 * status IN ('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED')
 */
public enum OperationStatus {
    DRAFT,
    WAITING,
    READY,
    DONE,
    CANCELLED
}
