import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Printer } from "lucide-react";

import { MOCK_ADJUSTMENTS } from "@/features/operations/mockData";
import type { OperationStatus } from "@/features/operations/types";
import type { AdjustmentReasonCode } from "@/features/operations/types";

import OperationPageHeader from "@/components/operations/OperationPageHeader";
import StatusPipeline from "@/components/operations/StatusPipeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

const REASON_LABELS: Record<AdjustmentReasonCode, string> = {
  PHYSICAL_COUNT: "Physical Count",
  DAMAGE:         "Damage",
  LOSS:           "Loss",
  FOUND:          "Found",
  INITIAL_STOCK:  "Initial Stock",
  CORRECTION:     "Correction",
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">
        {value ?? <span className="text-slate-300">—</span>}
      </dd>
    </div>
  );
}

export default function AdjustmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const adj = MOCK_ADJUSTMENTS.find((a) => a.id === id);

  if (!adj) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Adjustment <span className="font-mono">{id}</span> not found.
      </div>
    );
  }

  const handleValidate = () => alert(`[MOCK] Validate ${adj.referenceCode}`);
  const handlePrint    = () => window.print();

  const isDone = adj.status === "DONE";

  return (
    <div>
      <OperationPageHeader
        title={adj.referenceCode}
        subtitle="Inventory Adjustment"
        actions={
          <button
            id="adjustment-back"
            onClick={() => navigate("/operations/adjustments")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 print:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      {/* Status pipeline */}
      <div className="mb-6 print:hidden">
        <StatusPipeline
          operationType="ADJUSTMENT"
          status={adj.status as OperationStatus}
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 mb-6 print:hidden">
        {!isDone && (
          <button
            id="adjustment-validate"
            onClick={handleValidate}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-md transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Validate
          </button>
        )}
        <button
          id="adjustment-print"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-sm rounded-md hover:bg-slate-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
          <Field label="Reference"  value={adj.referenceCode} />
          <div>
            <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
              Status
            </dt>
            <dd>
              <StatusBadge status={adj.status as OperationStatus} />
            </dd>
          </div>
          <Field label="Warehouse"  value={adj.referenceWarehouse.name} />
          <Field label="Responsible" value={adj.responsibleUser?.loginId} />
          <Field
            label="Scheduled Date"
            value={
              adj.scheduledAt
                ? new Date(adj.scheduledAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : undefined
            }
          />
          {adj.completedAt && (
            <Field
              label="Completed Date"
              value={new Date(adj.completedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
          )}
          {adj.notes && (
            <div className="col-span-2 md:col-span-3">
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
                Notes
              </dt>
              <dd className="text-sm text-slate-700">{adj.notes}</dd>
            </div>
          )}
        </div>

        {/* Adjustment lines table */}
        <div className="p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Adjustment Lines
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">SKU</th>
                  <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                  <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                  <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right tabular-nums">System Qty</th>
                  <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right tabular-nums">Counted Qty</th>
                  <th className="py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right tabular-nums">Difference</th>
                  <th className="py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adj.adjustmentLines.map((line) => {
                  const diff = line.details.difference;
                  return (
                    <tr key={line.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">
                        {line.product.sku}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-800">{line.product.name}</td>
                      <td className="py-2.5 pr-4 text-slate-500 text-xs">{line.location.name}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-slate-600">
                        {line.details.systemQty.toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-slate-700 font-medium">
                        {line.details.countedQty.toLocaleString()}
                      </td>
                      <td
                        className={cn(
                          "py-2.5 pr-4 text-right tabular-nums font-semibold",
                          diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-slate-400"
                        )}
                      >
                        {diff > 0 ? "+" : ""}{diff.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-xs text-slate-500">
                        {REASON_LABELS[line.details.reasonCode]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
