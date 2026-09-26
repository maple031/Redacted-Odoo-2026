import type { OperationLine } from "@/features/operations/types";
import { cn } from "@/lib/utils";

interface Props {
  lines: OperationLine[];
  showLocations?: boolean;
  className?: string;
}

export default function LineItemsTable({
  lines,
  showLocations = true,
  className,
}: Props) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              SKU
            </th>
            <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Product
            </th>
            {showLocations && (
              <>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  From
                </th>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  To
                </th>
              </>
            )}
            <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right tabular-nums">
              Requested
            </th>
            <th className="py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right tabular-nums">
              Done
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {lines.map((line) => (
            <tr key={line.id} className="hover:bg-slate-50">
              <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">
                {line.product.sku}
              </td>
              <td className="py-2.5 pr-4 text-slate-800">
                {line.product.name}
              </td>
              {showLocations && (
                <>
                  <td className="py-2.5 pr-4 text-slate-500 text-xs">
                    {line.sourceLocation?.name ?? "—"}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500 text-xs">
                    {line.destinationLocation?.name ?? "—"}
                  </td>
                </>
              )}
              <td className="py-2.5 pr-4 text-right tabular-nums text-slate-700">
                {line.requestedQty.toLocaleString()}
                <span className="ml-1 text-slate-400 text-xs">
                  {line.product.uomSymbol}
                </span>
              </td>
              <td
                className={cn(
                  "py-2.5 text-right tabular-nums font-medium",
                  line.doneQty === line.requestedQty && line.requestedQty > 0
                    ? "text-green-600"
                    : line.doneQty > 0
                    ? "text-amber-600"
                    : "text-slate-400"
                )}
              >
                {line.doneQty.toLocaleString()}
                <span className="ml-1 text-slate-400 text-xs font-normal">
                  {line.product.uomSymbol}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
