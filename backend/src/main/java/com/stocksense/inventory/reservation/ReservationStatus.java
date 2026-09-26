package com.stocksense.inventory.reservation;

/**
 * Matches the database CHECK constraint in V002:
 * status IN ('ACTIVE', 'CONSUMED', 'RELEASED')
 */
public enum ReservationStatus {
    ACTIVE,
    CONSUMED,
    RELEASED
}
