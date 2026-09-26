import { Search, X, ChevronDown } from "lucide-react";
import type { OperationStatus } from "@/features/operations/types";

export interface OperationFiltersState {
  reference: string;
  contact: string;
  status: OperationStatus | "";
  warehouse: string;
}

interface Props {
  filters: OperationFiltersState;
  onChange: (next: OperationFiltersState) => void;
  showContactFilter?: boolean; // Only Receipts & Deliveries
  showWarehouseFilter?: boolean;
  availableStatuses?: OperationStatus[];
}

const STATUS_LABELS: Record<OperationStatus, string> = {
  DRAFT:     "Draft",
  WAITING:   "Waiting",
  READY:     "Ready",
  DONE:      "Done",
  CANCELLED: "Cancelled",
};

// Common select style shared across dropdowns
const SELECT_CLS =
  "pl-3 pr-8 py-1.5 text-sm border border-slate-200 rounded-md bg-white " +
  "text-slate-700 placeholder:text-slate-400 focus:outline-none " +
  "focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none cursor-pointer";

export default function OperationFilters({
  filters,
  onChange,
  showContactFilter = false,
  showWarehouseFilter = false,
  availableStatuses = ["DRAFT", "WAITING", "READY", "DONE", "CANCELLED"],
}: Props) {
  const set = <K extends keyof OperationFiltersState>(key: K, value: OperationFiltersState[K]) =>
    onChange({ ...filters, [key]: value });

  const clear = () => onChange({ reference: "", contact: "", status: "", warehouse: "" });

  const isDirty =
    filters.reference !== "" ||
    filters.contact   !== "" ||
    filters.status    !== "" ||
    filters.warehouse !== "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Reference search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          id="filter-reference"
          type="text"
          value={filters.reference}
          onChange={(e) => set("reference", e.target.value)}
          placeholder="Reference…"
          className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-44"
          aria-label="Filter by reference"
        />
      </div>

      {/* Contact filter — only for Receipts & Deliveries */}
      {showContactFilter && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            id="filter-contact"
            type="text"
            value={filters.contact}
            onChange={(e) => set("contact", e.target.value)}
            placeholder="Contact / Partner…"
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-48"
            aria-label="Filter by contact or partner"
          />
        </div>
      )}

      {/* Status filter */}
      <div className="relative">
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => set("status", e.target.value as OperationStatus | "")}
          className={`${SELECT_CLS} w-36`}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {availableStatuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>

      {/* Warehouse filter */}
      {showWarehouseFilter && (
        <div className="relative">
          <select
            id="filter-warehouse"
            value={filters.warehouse}
            onChange={(e) => set("warehouse", e.target.value)}
            className={`${SELECT_CLS} w-44`}
            aria-label="Filter by warehouse"
          >
            <option value="">All Warehouses</option>
            <option value="wh-1">Main Warehouse</option>
            <option value="wh-2">Hyderabad Store</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      )}

      {/* Clear */}
      {isDirty && (
        <button
          id="filter-clear"
          onClick={clear}
          className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          aria-label="Clear filters"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
