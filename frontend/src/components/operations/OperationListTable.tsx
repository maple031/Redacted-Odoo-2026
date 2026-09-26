import { useNavigate } from "react-router-dom";
import type { InventoryOperation } from "@/features/operations/types";
import StatusBadge from "./StatusBadge";

interface Props {
  operations: InventoryOperation[];
  detailBasePath: string; // e.g. "/operations/receipts"
  showPartner?: boolean;
  showLocations?: boolean;
}

export default function OperationListTable({
  operations,
  detailBasePath,
  showPartner = true,
  showLocations = false,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left bg-slate-50">
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Reference
            </th>
            {showPartner && (
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Partner
              </th>
            )}
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Warehouse
            </th>
            {showLocations && (
              <>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  From
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  To
                </th>
              </>
            )}
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right tabular-nums">
              Items
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
          {operations.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-10 text-center text-sm text-slate-400"
              >
                No operations match the current filters.
              </td>
            </tr>
          )}
          {operations.map((op) => (
            <tr
              key={op.id}
              onClick={() => navigate(`${detailBasePath}/${op.id}`)}
              className="hover:bg-slate-50 cursor-pointer"
            >
              <td className="px-4 py-2.5 font-mono text-xs text-brand-600 font-medium">
                {op.referenceCode}
              </td>
              {showPartner && (
                <td className="px-4 py-2.5 text-slate-700">
                  {op.partner?.name ?? <span className="text-slate-300">—</span>}
                </td>
              )}
              <td className="px-4 py-2.5 text-slate-500 text-xs">
                {op.referenceWarehouse.shortCode}
              </td>
              {showLocations && (
                <>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">
                    {op.lines[0]?.sourceLocation?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">
                    {op.lines[0]?.destinationLocation?.name ?? "—"}
                  </td>
                </>
              )}
              <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                {op.lines.length}
              </td>
              <td className="px-4 py-2.5 text-slate-500 text-xs tabular-nums">
                {op.scheduledAt
                  ? new Date(op.scheduledAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge status={op.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
