// ── Operation enumerations ──────────────────────────────────────────────────
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
export type OperationLine = {
  id: string;
  product: {
    id: string;
    sku: string;
    name: string;
    uomSymbol: string;
  };
  sourceLocation?: { id: string; name: string };
  destinationLocation?: { id: string; name: string };
  requestedQty: number;
  doneQty: number;
};

// ── Core aggregate ───────────────────────────────────────────────────────────
export type InventoryOperation = {
  id: string;
  referenceCode: string;
  operationType: OperationType;
  status: OperationStatus;
  partner?: { id: string; name: string };
  responsibleUser?: { id: string; name: string };
  referenceWarehouse: { id: string; name: string; shortCode: string };
  scheduledAt?: string;
  completedAt?: string;
  kanbanRank: number;
  notes?: string;
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

export type AdjustmentLineDetails = {
  systemQty: number;
  countedQty: number;
  reasonCode: AdjustmentReasonCode;
};
