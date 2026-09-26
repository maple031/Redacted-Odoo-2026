import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { MOCK_ADJUSTMENTS } from "@/features/operations/mockData";
import type { OperationFiltersState } from "@/components/operations/OperationFilters";
import type { OperationStatus } from "@/features/operations/types";

import OperationPageHeader from "@/components/operations/OperationPageHeader";
import OperationFilters from "@/components/operations/OperationFilters";
import { StatusBadge } from "@/components/ui/StatusBadge";

const DETAIL_BASE = "/operations/adjustments";

export default function AdjustmentPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OperationFiltersState>({
    reference: "",
    contact: "",
  });

  const filtered = useMemo(() => {
    return MOCK_ADJUSTMENTS.filter((adj) =>
      adj.referenceCode.toLowerCase().includes(filters.reference.toLowerCase())
    );
  }, [filters.reference]);

  return (
    <div>
      <OperationPageHeader
        title="Inventory Adjustments"
        subtitle="Physical counts and stock corrections"
        actions={
          <button
            id="adjustments-new"
            onClick={() => navigate(`${DETAIL_BASE}/new`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        }
      />

      {/* No contact filter for Adjustments */}
      <div className="mb-4">
        <OperationFilters
          filters={filters}
          onChange={setFilters}
          showContactFilter={false}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Reference
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Warehouse
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Responsible
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right tabular-nums">
                Lines
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Scheduled
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  No adjustments match the current filters.
                </td>
              </tr>
            )}
            {filtered.map((adj) => (
              <tr
                key={adj.id}
                onClick={() => navigate(`${DETAIL_BASE}/${adj.id}`)}
                className="hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-4 py-2.5 font-mono text-xs text-brand-600 font-medium">
                  {adj.referenceCode}
                </td>
                <td className="px-4 py-2.5 text-slate-500 text-xs">
                  {adj.referenceWarehouse.shortCode}
                </td>
                <td className="px-4 py-2.5 text-slate-700">
                  {adj.responsibleUser?.name ?? <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                  {adj.adjustmentLines.length}
                </td>
                <td className="px-4 py-2.5 text-slate-500 text-xs tabular-nums">
                  {adj.scheduledAt
                    ? new Date(adj.scheduledAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={adj.status as OperationStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
