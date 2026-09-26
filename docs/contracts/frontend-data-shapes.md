# Frontend Data Shapes Contract

This document is the shared contract between frontend domains (Auth, Settings/Catalog, Operations) and future Spring response DTOs.

## General Contract Rules
- Database IDs are UUIDs.
- JSON/TypeScript represents UUIDs as strings.
- TIMESTAMPTZ is exposed as ISO-8601 strings.
- Inventory quantities originate from PostgreSQL NUMERIC.
- Frontend numeric values are for display/input only; backend/database remain authoritative.
- Frontend must never maintain `product.quantity`.
- Current stock comes from `inventory_balance`.
- `availableQty` comes from the authoritative balance projection.
- Mock data should use these exact DTO shapes.
- Later TanStack Query/API integration should replace mock data sources without redesigning components.
- Enum/status strings must use the exact documented values.

## Warehouse
```typescript
type Warehouse = {
  id: string
  name: string
  shortCode: string
  address: string | null
  active: boolean
}
```
*Database mapping:* `warehouse.short_code` -> `shortCode` (Do not expose the old V001 name `code`).

## Location
```typescript
type LocationType =
  | "INTERNAL"
  | "VENDOR"
  | "CUSTOMER"
  | "LOSS"
  | "TRANSIT"

type Location = {
  id: string
  name: string
  code: string
  locationType: LocationType
  warehouseId: string | null
  parentLocationId: string | null
}
```
*Database mapping:* `location.location_type` -> `locationType`, `location.warehouse_id` -> `warehouseId`, `location.parent_id` -> `parentLocationId`
*Important:* The finalized location schema does not actually have an `active` property. If the mock currently has `active`, it is NOT persisted by the current schema and must be reconciled during real integration.

## Category
```typescript
type Category = {
  id: string
  name: string
  parentId: string | null
}
```
*Important:* There is no `active` property in the database.

## UnitOfMeasure
```typescript
type UnitOfMeasure = {
  id: string
  name: string
  symbol: string
}
```

## Product
```typescript
type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  category: {
    id: string
    name: string
  } | null
  uom: {
    id: string
    name: string
    symbol: string
  }
  active: boolean
}
```
*Important:* The response DTO exposes nested summaries. Do not invent stock quantity inside Product.

## BusinessPartner
```typescript
type BusinessPartner = {
  id: string
  name: string
  isSupplier: boolean
  isCustomer: boolean
  email: string | null
  phone: string | null
  active: boolean
}
```
*Important:* A partner may be a supplier, a customer, or both. There must NOT be separate Supplier and Customer domain objects.

## ReorderRule
```typescript
type ReorderRule = {
  id: string
  productId: string
  warehouseId: string
  minQty: number
  targetQty: number | null
  active: boolean
}
```
*Note:* Actual backend implementation should use `BigDecimal` for NUMERIC values. Do not place reorder values on Product.

## ProductStockRow (READ MODEL)
```typescript
type StockStatus =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"

type ProductStockRow = {
  productId: string
  sku: string
  productName: string
  categoryName: string | null
  uomSymbol: string

  warehouseId: string
  warehouseName: string

  locationId: string
  locationName: string

  onHandQty: number
  reservedQty: number
  availableQty: number

  stockStatus: StockStatus
}
```
*Important:* `ProductStockRow` is a READ MODEL. There is no `ProductStockRow` table. It will eventually be derived from `product`, `inventory_balance`, `location`, `warehouse`, `category`, `unit_of_measure`, and `reorder_rule`.

## Operation Enums
```typescript
type OperationType =
  | "RECEIPT"
  | "DELIVERY"
  | "TRANSFER"
  | "ADJUSTMENT"

type OperationStatus =
  | "DRAFT"
  | "WAITING"
  | "READY"
  | "DONE"
  | "CANCELLED"
```
*Important:* These values must exactly match the database CHECK constraints.

## OperationLine
```typescript
type OperationLine = {
  id: string

  product: {
    id: string
    sku: string
    name: string
    uomSymbol: string
  }

  sourceLocation: {
    id: string
    name: string
  } | null

  destinationLocation: {
    id: string
    name: string
  } | null

  requestedQty: number
  doneQty: number
}
```
*Database mapping:* `source_location_id` -> `sourceLocation`, `destination_location_id` -> `destinationLocation`, `requested_qty` -> `requestedQty`, `done_qty` -> `doneQty`.

## InventoryOperation
```typescript
type InventoryOperation = {
  id: string
  referenceCode: string

  operationType: OperationType
  status: OperationStatus

  partner: {
    id: string
    name: string
  } | null

  responsibleUser: {
    id: string
    loginId: string
  } | null

  referenceWarehouse: {
    id: string
    name: string
    shortCode: string
  }

  scheduledAt: string | null
  completedAt: string | null
  cancelledAt: string | null

  kanbanRank: number

  notes: string | null

  lines: OperationLine[]
}
```
*Clarification:* `referenceWarehouse` is the warehouse used to generate the operation reference. It is NOT a replacement for line-level physical source/destination locations.

## DeliveryDetails
```typescript
type DeliveryDetails = {
  deliveryAddress: string
}
```
*Database source:* `delivery_detail.delivery_address`.

## AdjustmentLineDetails
```typescript
type AdjustmentReason =
  | "PHYSICAL_COUNT"
  | "DAMAGE"
  | "LOSS"
  | "FOUND"
  | "INITIAL_STOCK"
  | "CORRECTION"

type AdjustmentLineDetails = {
  systemQty: number
  countedQty: number
  difference: number
  reasonCode: AdjustmentReason
}
```
*Important:* `difference` is a frontend/API read value (`countedQty - systemQty`). It is NOT persisted as a separate database column.

## Auth Summary
```typescript
type UserSummary = {
  id: string
  loginId: string
  email: string
  role: "INVENTORY_MANAGER" | "WAREHOUSE_STAFF"
  active: boolean
}
```
*Important:* Do NOT expose `passwordHash` or password reset code hashes.

Signup input concept:
- `loginId`
- `email`
- `password`
- `confirmPassword` (request/UI validation only, never persisted)

## Dashboard (FUTURE READ MODEL)
```typescript
type DashboardKpis = {
  receipts: {
    toReceive: number
    late: number
    operations: number
  }

  deliveries: {
    toDeliver: number
    late: number
    waiting: number
    operations: number
  }
}
```
*Important:* There is no dashboard table. These values will be derived from `inventory_operation`.

## Move History (FUTURE READ MODEL)
```typescript
type MoveHistoryRow = {
  id: string
  referenceCode: string
  movedAt: string

  product: {
    id: string
    sku: string
    name: string
  }

  sourceLocation: {
    id: string
    name: string
  }

  destinationLocation: {
    id: string
    name: string
  }

  qty: number

  performedBy: {
    id: string
    loginId: string
  } | null
}
```
*Important:* There is no Move History table. This comes from `stock_movement` joined to operation/product/location/user data.

## Cycle 1 Mock Compatibility
- `Warehouse`: Mocks might use `code`, but the contract dictates `shortCode`.
- `Location`: Mocks might lack `parentLocationId`. Mocks might include an `active` flag which is not supported by the database.
- `BusinessPartner`: Partner field names must match `BusinessPartner` rather than separate `Supplier` or `Customer` properties.
- `ProductStockRow`, `InventoryOperation`, `OperationLine`, `DeliveryDetails`, `AdjustmentLineDetails`: Mocks should be updated to strictly adhere to these shapes during Cycle 2/3 integration.
