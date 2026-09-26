package com.stocksense.operations.core;

import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Validates state transitions for InventoryOperation entities.
 */
@Component
public class OperationTransitionGuard {

    /**
     * Asserts that transitioning from the current state to the target state is allowed.
     *
     * @param current the current status
     * @param target  the desired status
     * @throws IllegalStateException if the transition is forbidden
     */
    public void validateTransition(OperationStatus current, OperationStatus target) {
        if (current == target) {
            return; // No-op
        }

        boolean allowed = switch (current) {
            case DRAFT -> Set.of(OperationStatus.WAITING, OperationStatus.READY, OperationStatus.CANCELLED).contains(target);
            case WAITING -> Set.of(OperationStatus.READY, OperationStatus.CANCELLED).contains(target);
            case READY -> Set.of(OperationStatus.DONE, OperationStatus.CANCELLED).contains(target);
            case DONE -> false; // Terminal state, no outbound transitions
            case CANCELLED -> target == OperationStatus.DRAFT; // Allow reset to draft
        };

        if (!allowed) {
            throw new IllegalStateException(
                    String.format("Invalid state transition from %s to %s", current, target)
            );
        }
    }
}
