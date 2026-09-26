// ── Operation enumerations ──────────────────────────────────────────────────
// These values MUST match the database CHECK constraints exactly.
export type OperationType =
  | "RECEIPT"
  | "DELIVERY"
  | "TRANSFER"
  | "ADJUSTMENT";

export type OperationStatus =
  | "DRAFT"
  | "WAITING"
  | "READY"
  | "DONE"
  | "CANCELLED";

// ── Sub-entities ────────────────────────────────────────────────────────────
// Contract: sourceLocation / destinationLocation are null when not applicable
export type OperationLine = {
  id: string;
  product: {
    id: string;
    sku: string;
    name: string;
    uomSymbol: string;
  };
  sourceLocation: { id: string; name: string } | null;
  destinationLocation: { id: string; name: string } | null;
  requestedQty: number;
  doneQty: number;
};

// ── Core aggregate ───────────────────────────────────────────────────────────
// Contract: responsibleUser exposes { id, loginId } — NOT name.
// Contract: optional fields use explicit null (not undefined/optional).
export type InventoryOperation = {
  id: string;
  referenceCode: string;
  operationType: OperationType;
  status: OperationStatus;
  partner: { id: string; name: string } | null;
  responsibleUser: { id: string; loginId: string } | null;
  referenceWarehouse: { id: string; name: string; shortCode: string };
  scheduledAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  kanbanRank: number;
  notes: string | null;
  lines: OperationLine[];
};

// ── Type-specific detail extensions ─────────────────────────────────────────
export type DeliveryDetails = {
  deliveryAddress: string;
};

export type AdjustmentReasonCode =
  | "PHYSICAL_COUNT"
  | "DAMAGE"
  | "LOSS"
  | "FOUND"
  | "INITIAL_STOCK"
  | "CORRECTION";

// Contract: difference is a derived read value (countedQty - systemQty),
// NOT persisted as a separate DB column, but included in the API response shape.
export type AdjustmentLineDetails = {
  systemQty: number;
  countedQty: number;
  difference: number;
  reasonCode: AdjustmentReasonCode;
};
