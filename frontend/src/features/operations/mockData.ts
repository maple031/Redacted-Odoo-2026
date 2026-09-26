import type { InventoryOperation, AdjustmentLineDetails } from "./types";

// ── Warehouses ───────────────────────────────────────────────────────────────
const WH_MAIN = { id: "wh-1", name: "Main Warehouse", shortCode: "WH" };
const WH_HYD  = { id: "wh-2", name: "Hyderabad Store", shortCode: "HYD" };

// ── Locations ────────────────────────────────────────────────────────────────
const LOC_VENDORS  = { id: "loc-vendors",  name: "Vendors" };
const LOC_RECEIPT  = { id: "loc-receipt",  name: "WH/Input" };
const LOC_SHELF_A  = { id: "loc-shelf-a",  name: "WH/Stock/Shelf-A" };
const LOC_SHELF_B  = { id: "loc-shelf-b",  name: "WH/Stock/Shelf-B" };
const LOC_SHELF_C  = { id: "loc-shelf-c",  name: "WH/Stock/Shelf-C" };
const LOC_CUSTOMER = { id: "loc-customer", name: "Customers" };
const LOC_TRANSIT  = { id: "loc-transit",  name: "Transit Zone" };
const LOC_HYD      = { id: "loc-hyd",      name: "HYD/Stock" };

// ── Partners ─────────────────────────────────────────────────────────────────
const PARTNER_TECHZONE  = { id: "p-1", name: "TechZone Suppliers Pvt. Ltd." };
const PARTNER_GLOBALCOM = { id: "p-2", name: "GlobalCom Electronics" };
const PARTNER_INFRA     = { id: "p-3", name: "Infra Solutions Ltd." };
const PARTNER_CLIENT_A  = { id: "p-4", name: "Acme Corp" };
const PARTNER_CLIENT_B  = { id: "p-5", name: "Sunrise Retail" };

// ── Users — contract shape: { id, loginId } ─────────────────────────────────
const USER_PRIYA = { id: "u-1", loginId: "priya.sharma" };
const USER_RAHUL = { id: "u-2", loginId: "rahul.verma" };
const USER_ANITA = { id: "u-3", loginId: "anita.desai" };

// ── Products ─────────────────────────────────────────────────────────────────
const PROD_LAPTOP  = { id: "prod-1", sku: "EL-LT-001", name: "Laptop 15\" ProX",       uomSymbol: "Unit" };
const PROD_MOUSE   = { id: "prod-2", sku: "EL-MS-002", name: "Wireless Mouse",          uomSymbol: "Unit" };
const PROD_CABLE   = { id: "prod-3", sku: "EL-CB-003", name: "USB-C Cable 1m",          uomSymbol: "Unit" };
const PROD_MONITOR = { id: "prod-4", sku: "EL-MN-004", name: '27" 4K Monitor',          uomSymbol: "Unit" };
const PROD_HEADSET = { id: "prod-5", sku: "EL-HS-005", name: "Noise-Cancel Headset",    uomSymbol: "Unit" };
const PROD_DOCK    = { id: "prod-6", sku: "EL-DK-006", name: "USB-C Docking Station",   uomSymbol: "Unit" };
const PROD_WEBCAM  = { id: "prod-7", sku: "EL-WC-007", name: "1080p Webcam",            uomSymbol: "Unit" };
const PROD_PAPER   = { id: "prod-8", sku: "OF-PP-001", name: "A4 Paper Ream 500s",      uomSymbol: "Ream" };
const PROD_TONER   = { id: "prod-9", sku: "OF-TN-002", name: "Laser Toner Cartridge",   uomSymbol: "Unit" };

// ════════════════════════════════════════════════════════════════════════════
// RECEIPTS
// ════════════════════════════════════════════════════════════════════════════
export const MOCK_RECEIPTS: InventoryOperation[] = [
  {
    id: "rcpt-1",
    referenceCode: "WH/IN/0001",
    operationType: "RECEIPT",
    status: "DONE",
    partner: PARTNER_TECHZONE,
    responsibleUser: USER_PRIYA,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-10T09:00:00Z",
    completedAt: "2026-09-10T14:32:00Z",
    cancelledAt: null,
    kanbanRank: 10,
    notes: "Q3 hardware replenishment batch.",
    lines: [
      { id: "rl-1", product: PROD_LAPTOP,  sourceLocation: LOC_VENDORS, destinationLocation: LOC_SHELF_A, requestedQty: 20, doneQty: 20 },
      { id: "rl-2", product: PROD_MONITOR, sourceLocation: LOC_VENDORS, destinationLocation: LOC_SHELF_A, requestedQty: 10, doneQty: 10 },
      { id: "rl-3", product: PROD_DOCK,    sourceLocation: LOC_VENDORS, destinationLocation: LOC_SHELF_B, requestedQty: 15, doneQty: 14 },
    ],
  },
  {
    id: "rcpt-2",
    referenceCode: "WH/IN/0002",
    operationType: "RECEIPT",
    status: "READY",
    partner: PARTNER_GLOBALCOM,
    responsibleUser: USER_RAHUL,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-25T10:00:00Z",
    completedAt: null,
    cancelledAt: null,
    kanbanRank: 20,
    notes: null,
    lines: [
      { id: "rl-4", product: PROD_MOUSE,  sourceLocation: LOC_VENDORS, destinationLocation: LOC_SHELF_B, requestedQty: 50,  doneQty: 0 },
      { id: "rl-5", product: PROD_CABLE,  sourceLocation: LOC_VENDORS, destinationLocation: LOC_SHELF_B, requestedQty: 100, doneQty: 0 },
      { id: "rl-6", product: PROD_WEBCAM, sourceLocation: LOC_VENDORS, destinationLocation: LOC_SHELF_C, requestedQty: 25,  doneQty: 0 },
    ],
  },
  {
    id: "rcpt-3",
    referenceCode: "WH/IN/0003",
    operationType: "RECEIPT",
    status: "DRAFT",
    partner: PARTNER_INFRA,
    responsibleUser: USER_ANITA,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-30T11:00:00Z",
    completedAt: null,
    cancelledAt: null,
    kanbanRank: 30,
    notes: "Pending PO confirmation from supplier.",
    lines: [
      { id: "rl-7", product: PROD_HEADSET, sourceLocation: LOC_VENDORS, destinationLocation: LOC_SHELF_C, requestedQty: 30,  doneQty: 0 },
      { id: "rl-8", product: PROD_PAPER,   sourceLocation: LOC_VENDORS, destinationLocation: LOC_SHELF_C, requestedQty: 200, doneQty: 0 },
    ],
  },
  {
    id: "rcpt-4",
    referenceCode: "HYD/IN/0001",
    operationType: "RECEIPT",
    status: "DONE",
    partner: PARTNER_TECHZONE,
    responsibleUser: USER_PRIYA,
    referenceWarehouse: WH_HYD,
    scheduledAt: "2026-09-05T08:00:00Z",
    completedAt: "2026-09-05T13:00:00Z",
    cancelledAt: null,
    kanbanRank: 40,
    notes: null,
    lines: [
      { id: "rl-9",  product: PROD_LAPTOP, sourceLocation: LOC_VENDORS, destinationLocation: LOC_HYD, requestedQty: 5,  doneQty: 5  },
      { id: "rl-10", product: PROD_MOUSE,  sourceLocation: LOC_VENDORS, destinationLocation: LOC_HYD, requestedQty: 10, doneQty: 10 },
    ],
  },
  {
    id: "rcpt-5",
    referenceCode: "HYD/IN/0002",
    operationType: "RECEIPT",
    status: "CANCELLED",
    partner: PARTNER_GLOBALCOM,
    responsibleUser: USER_RAHUL,
    referenceWarehouse: WH_HYD,
    scheduledAt: "2026-09-18T10:00:00Z",
    completedAt: null,
    cancelledAt: "2026-09-19T08:00:00Z",
    kanbanRank: 50,
    notes: "Cancelled — supplier unable to fulfil order.",
    lines: [
      { id: "rl-11", product: PROD_TONER, sourceLocation: LOC_VENDORS, destinationLocation: LOC_HYD, requestedQty: 20, doneQty: 0 },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════════════
// DELIVERIES
// ════════════════════════════════════════════════════════════════════════════
export const MOCK_DELIVERIES: InventoryOperation[] = [
  {
    id: "dely-1",
    referenceCode: "WH/OUT/0001",
    operationType: "DELIVERY",
    status: "DONE",
    partner: PARTNER_CLIENT_A,
    responsibleUser: USER_PRIYA,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-12T09:00:00Z",
    completedAt: "2026-09-12T16:00:00Z",
    cancelledAt: null,
    kanbanRank: 10,
    notes: null,
    lines: [
      { id: "dl-1", product: PROD_LAPTOP,  sourceLocation: LOC_SHELF_A, destinationLocation: LOC_CUSTOMER, requestedQty: 5, doneQty: 5 },
      { id: "dl-2", product: PROD_MONITOR, sourceLocation: LOC_SHELF_A, destinationLocation: LOC_CUSTOMER, requestedQty: 5, doneQty: 5 },
      { id: "dl-3", product: PROD_DOCK,    sourceLocation: LOC_SHELF_B, destinationLocation: LOC_CUSTOMER, requestedQty: 5, doneQty: 5 },
    ],
  },
  {
    id: "dely-2",
    referenceCode: "WH/OUT/0002",
    operationType: "DELIVERY",
    status: "READY",
    partner: PARTNER_CLIENT_B,
    responsibleUser: USER_ANITA,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-27T10:00:00Z",
    completedAt: null,
    cancelledAt: null,
    kanbanRank: 20,
    notes: null,
    lines: [
      { id: "dl-4", product: PROD_MOUSE,  sourceLocation: LOC_SHELF_B, destinationLocation: LOC_CUSTOMER, requestedQty: 20, doneQty: 0 },
      { id: "dl-5", product: PROD_CABLE,  sourceLocation: LOC_SHELF_B, destinationLocation: LOC_CUSTOMER, requestedQty: 40, doneQty: 0 },
      { id: "dl-6", product: PROD_WEBCAM, sourceLocation: LOC_SHELF_C, destinationLocation: LOC_CUSTOMER, requestedQty: 8,  doneQty: 0 },
    ],
  },
  {
    id: "dely-3",
    referenceCode: "WH/OUT/0003",
    operationType: "DELIVERY",
    status: "WAITING",
    partner: PARTNER_CLIENT_A,
    responsibleUser: USER_RAHUL,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-29T09:00:00Z",
    completedAt: null,
    cancelledAt: null,
    kanbanRank: 30,
    notes: "Awaiting payment confirmation.",
    lines: [
      { id: "dl-7", product: PROD_HEADSET, sourceLocation: LOC_SHELF_C, destinationLocation: LOC_CUSTOMER, requestedQty: 10, doneQty: 0 },
    ],
  },
  {
    id: "dely-4",
    referenceCode: "WH/OUT/0004",
    operationType: "DELIVERY",
    status: "DRAFT",
    partner: PARTNER_CLIENT_B,
    responsibleUser: USER_PRIYA,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-10-02T10:00:00Z",
    completedAt: null,
    cancelledAt: null,
    kanbanRank: 40,
    notes: null,
    lines: [
      { id: "dl-8", product: PROD_LAPTOP, sourceLocation: LOC_SHELF_A, destinationLocation: LOC_CUSTOMER, requestedQty: 3, doneQty: 0 },
      { id: "dl-9", product: PROD_DOCK,   sourceLocation: LOC_SHELF_B, destinationLocation: LOC_CUSTOMER, requestedQty: 3, doneQty: 0 },
    ],
  },
  {
    id: "dely-5",
    referenceCode: "WH/OUT/0005",
    operationType: "DELIVERY",
    status: "CANCELLED",
    partner: PARTNER_CLIENT_A,
    responsibleUser: USER_ANITA,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-20T11:00:00Z",
    completedAt: null,
    cancelledAt: "2026-09-20T15:00:00Z",
    kanbanRank: 50,
    notes: "Order cancelled by customer.",
    lines: [
      { id: "dl-10", product: PROD_PAPER, sourceLocation: LOC_SHELF_C, destinationLocation: LOC_CUSTOMER, requestedQty: 50, doneQty: 0 },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════════════
// TRANSFERS
// ════════════════════════════════════════════════════════════════════════════
export const MOCK_TRANSFERS: InventoryOperation[] = [
  {
    id: "trf-1",
    referenceCode: "WH/TRSF/0001",
    operationType: "TRANSFER",
    status: "DONE",
    partner: null,
    responsibleUser: USER_RAHUL,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-08T08:00:00Z",
    completedAt: "2026-09-08T11:30:00Z",
    cancelledAt: null,
    kanbanRank: 10,
    notes: null,
    lines: [
      { id: "tl-1", product: PROD_LAPTOP,  sourceLocation: LOC_RECEIPT, destinationLocation: LOC_SHELF_A, requestedQty: 20, doneQty: 20 },
      { id: "tl-2", product: PROD_MONITOR, sourceLocation: LOC_RECEIPT, destinationLocation: LOC_SHELF_A, requestedQty: 10, doneQty: 10 },
    ],
  },
  {
    id: "trf-2",
    referenceCode: "WH/TRSF/0002",
    operationType: "TRANSFER",
    status: "READY",
    partner: null,
    responsibleUser: USER_PRIYA,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-26T09:00:00Z",
    completedAt: null,
    cancelledAt: null,
    kanbanRank: 20,
    notes: "Rebalancing between shelf zones.",
    lines: [
      { id: "tl-3", product: PROD_MOUSE, sourceLocation: LOC_SHELF_B, destinationLocation: LOC_SHELF_C, requestedQty: 25, doneQty: 0 },
      { id: "tl-4", product: PROD_CABLE, sourceLocation: LOC_SHELF_B, destinationLocation: LOC_SHELF_C, requestedQty: 50, doneQty: 0 },
    ],
  },
  {
    id: "trf-3",
    referenceCode: "WH/TRSF/0003",
    operationType: "TRANSFER",
    status: "WAITING",
    partner: null,
    responsibleUser: USER_ANITA,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-28T13:00:00Z",
    completedAt: null,
    cancelledAt: null,
    kanbanRank: 30,
    notes: null,
    lines: [
      { id: "tl-5", product: PROD_HEADSET, sourceLocation: LOC_SHELF_C, destinationLocation: LOC_TRANSIT, requestedQty: 10, doneQty: 0 },
    ],
  },
  {
    id: "trf-4",
    referenceCode: "INT/TRSF/0001",
    operationType: "TRANSFER",
    status: "DRAFT",
    partner: null,
    responsibleUser: USER_RAHUL,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-10-01T08:00:00Z",
    completedAt: null,
    cancelledAt: null,
    kanbanRank: 40,
    notes: "Planned inter-warehouse transfer to HYD.",
    lines: [
      { id: "tl-6", product: PROD_LAPTOP,  sourceLocation: LOC_SHELF_A, destinationLocation: LOC_HYD, requestedQty: 5, doneQty: 0 },
      { id: "tl-7", product: PROD_MONITOR, sourceLocation: LOC_SHELF_A, destinationLocation: LOC_HYD, requestedQty: 3, doneQty: 0 },
      { id: "tl-8", product: PROD_HEADSET, sourceLocation: LOC_SHELF_C, destinationLocation: LOC_HYD, requestedQty: 8, doneQty: 0 },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════════════
// ADJUSTMENTS
// ════════════════════════════════════════════════════════════════════════════
// Note: AdjustmentOperation is a local mock type — it does NOT extend
// InventoryOperation because adjustments use adjustmentLines, not lines.
export type AdjustmentLine = {
  id: string;
  product: { id: string; sku: string; name: string; uomSymbol: string };
  location: { id: string; name: string };
  details: AdjustmentLineDetails;
};

export type AdjustmentOperation = {
  id: string;
  referenceCode: string;
  operationType: "ADJUSTMENT";
  status: "DRAFT" | "READY" | "DONE";
  /** Contract: { id, loginId } — NOT name */
  responsibleUser: { id: string; loginId: string } | null;
  referenceWarehouse: { id: string; name: string; shortCode: string };
  scheduledAt: string | null;
  completedAt: string | null;
  kanbanRank: number;
  notes: string | null;
  adjustmentLines: AdjustmentLine[];
};

/** Helper: build an AdjustmentLineDetails with auto-computed difference */
function adj(
  systemQty: number,
  countedQty: number,
  reasonCode: AdjustmentLineDetails["reasonCode"]
): AdjustmentLineDetails {
  return { systemQty, countedQty, difference: countedQty - systemQty, reasonCode };
}

export const MOCK_ADJUSTMENTS: AdjustmentOperation[] = [
  {
    id: "adj-1",
    referenceCode: "WH/ADJ/0001",
    operationType: "ADJUSTMENT",
    status: "DONE",
    responsibleUser: USER_PRIYA,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-15T08:00:00Z",
    completedAt: "2026-09-15T12:00:00Z",
    kanbanRank: 10,
    notes: "End-of-quarter physical count.",
    adjustmentLines: [
      { id: "al-1", product: PROD_LAPTOP,  location: LOC_SHELF_A, details: adj(20,  18,  "PHYSICAL_COUNT") },
      { id: "al-2", product: PROD_MOUSE,   location: LOC_SHELF_B, details: adj(50,  48,  "LOSS")           },
      { id: "al-3", product: PROD_CABLE,   location: LOC_SHELF_B, details: adj(100, 100, "PHYSICAL_COUNT") },
      { id: "al-4", product: PROD_MONITOR, location: LOC_SHELF_A, details: adj(10,  9,   "DAMAGE")         },
    ],
  },
  {
    id: "adj-2",
    referenceCode: "WH/ADJ/0002",
    operationType: "ADJUSTMENT",
    status: "READY",
    responsibleUser: USER_RAHUL,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-26T09:00:00Z",
    completedAt: null,
    kanbanRank: 20,
    notes: null,
    adjustmentLines: [
      { id: "al-5", product: PROD_HEADSET, location: LOC_SHELF_C, details: adj(30, 32, "FOUND")          },
      { id: "al-6", product: PROD_DOCK,    location: LOC_SHELF_B, details: adj(14, 14, "PHYSICAL_COUNT") },
    ],
  },
  {
    id: "adj-3",
    referenceCode: "WH/ADJ/0003",
    operationType: "ADJUSTMENT",
    status: "DRAFT",
    responsibleUser: USER_ANITA,
    referenceWarehouse: WH_MAIN,
    scheduledAt: "2026-09-30T10:00:00Z",
    completedAt: null,
    kanbanRank: 30,
    notes: "Initial stock entry for new product range.",
    adjustmentLines: [
      { id: "al-7", product: PROD_TONER,  location: LOC_SHELF_C, details: adj(0,  40,  "INITIAL_STOCK") },
      { id: "al-8", product: PROD_PAPER,  location: LOC_SHELF_C, details: adj(0,  200, "INITIAL_STOCK") },
      { id: "al-9", product: PROD_WEBCAM, location: LOC_SHELF_C, details: adj(25, 23,  "CORRECTION")    },
    ],
  },
  {
    id: "adj-4",
    referenceCode: "HYD/ADJ/0001",
    operationType: "ADJUSTMENT",
    status: "DONE",
    responsibleUser: USER_PRIYA,
    referenceWarehouse: WH_HYD,
    scheduledAt: "2026-09-20T08:00:00Z",
    completedAt: "2026-09-20T10:00:00Z",
    kanbanRank: 40,
    notes: null,
    adjustmentLines: [
      { id: "al-10", product: PROD_LAPTOP, location: LOC_HYD, details: adj(5,  5, "PHYSICAL_COUNT") },
      { id: "al-11", product: PROD_MOUSE,  location: LOC_HYD, details: adj(10, 9, "DAMAGE")         },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════════════
// Unified lookup helpers
// ════════════════════════════════════════════════════════════════════════════
export const ALL_OPERATIONS: InventoryOperation[] = [
  ...MOCK_RECEIPTS,
  ...MOCK_DELIVERIES,
  ...MOCK_TRANSFERS,
];

export function findOperation(id: string): InventoryOperation | undefined {
  return ALL_OPERATIONS.find((op) => op.id === id);
}

export function findAdjustment(id: string): AdjustmentOperation | undefined {
  return MOCK_ADJUSTMENTS.find((adj) => adj.id === id);
}
