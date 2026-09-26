import { Search, X } from "lucide-react";

export interface OperationFiltersState {
  reference: string;
  contact: string;
}

interface Props {
  filters: OperationFiltersState;
  onChange: (next: OperationFiltersState) => void;
  showContactFilter?: boolean; // Only Receipts & Deliveries
}

export default function OperationFilters({
  filters,
  onChange,
  showContactFilter = false,
}: Props) {
  const set = (key: keyof OperationFiltersState, value: string) =>
    onChange({ ...filters, [key]: value });

  const clear = () => onChange({ reference: "", contact: "" });

  const isDirty = filters.reference !== "" || filters.contact !== "";

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
          className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-48"
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
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-52"
            aria-label="Filter by contact or partner"
          />
        </div>
      )}

      {/* Clear */}
      {isDirty && (
        <button
          id="filter-clear"
          onClick={clear}
          className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50"
          aria-label="Clear filters"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
