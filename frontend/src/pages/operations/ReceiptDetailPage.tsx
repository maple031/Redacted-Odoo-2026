import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Printer, XCircle } from "lucide-react";

import { MOCK_RECEIPTS } from "@/features/operations/mockData";
import OperationPageHeader from "@/components/operations/OperationPageHeader";
import StatusPipeline from "@/components/operations/StatusPipeline";
import LineItemsTable from "@/components/operations/LineItemsTable";
import StatusBadge from "@/components/operations/StatusBadge";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">{value ?? <span className="text-slate-300">—</span>}</dd>
    </div>
  );
}

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const op = MOCK_RECEIPTS.find((r) => r.id === id);

  if (!op) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Receipt <span className="font-mono">{id}</span> not found.
      </div>
    );
  }

  // Mock action handlers
  const handleValidate = () => alert(`[MOCK] Validate ${op.referenceCode}`);
  const handlePrint    = () => alert(`[MOCK] Print ${op.referenceCode}`);
  const handleCancel   = () => alert(`[MOCK] Cancel ${op.referenceCode}`);

  const isDone      = op.status === "DONE";
  const isCancelled = op.status === "CANCELLED";

  return (
    <div>
      <OperationPageHeader
        title={op.referenceCode}
        subtitle="Receipt"
        actions={
          <button
            id="receipt-back"
            onClick={() => navigate("/operations/receipts")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      {/* Status pipeline */}
      <div className="mb-6">
        <StatusPipeline operationType="RECEIPT" status={op.status} />
      </div>

      {/* Action bar */}
      {!isDone && !isCancelled && (
        <div className="flex items-center gap-2 mb-6">
          <button
            id="receipt-validate"
            onClick={handleValidate}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-md transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Validate
          </button>
          <button
            id="receipt-print"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-sm rounded-md hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            id="receipt-cancel"
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-sm rounded-md hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}
      {isDone && (
        <div className="flex items-center gap-2 mb-6">
          <button id="receipt-print-done" onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-sm rounded-md hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      )}

      {/* Detail card */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {/* Header fields */}
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
          <Field label="Reference"      value={op.referenceCode} />
          <Field label="Status"
            value={undefined}
          />
          <div>
            <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">Status</dt>
            <dd><StatusBadge status={op.status} /></dd>
          </div>
          <Field label="Receive From"   value={op.partner?.name} />
          <Field label="Warehouse"      value={op.referenceWarehouse.name} />
          <Field label="Responsible"    value={op.responsibleUser?.name} />
          <Field label="Scheduled Date"
            value={op.scheduledAt
              ? new Date(op.scheduledAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
              : undefined}
          />
          {op.completedAt && (
            <Field label="Completed Date"
              value={new Date(op.completedAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
            />
          )}
          {op.notes && (
            <div className="col-span-2 md:col-span-3">
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">Notes</dt>
              <dd className="text-sm text-slate-700">{op.notes}</dd>
            </div>
          )}
        </div>

        {/* Line items */}
        <div className="p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Products / Quantities
          </h2>
          <LineItemsTable lines={op.lines} showLocations={true} />
        </div>
      </div>
    </div>
  );
}
