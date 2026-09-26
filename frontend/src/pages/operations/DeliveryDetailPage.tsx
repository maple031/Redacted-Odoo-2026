import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Printer, XCircle } from "lucide-react";

import { MOCK_DELIVERIES } from "@/features/operations/mockData";
import OperationPageHeader from "@/components/operations/OperationPageHeader";
import StatusPipeline from "@/components/operations/StatusPipeline";
import LineItemsTable from "@/components/operations/LineItemsTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

// Delivery address is a mock extension — stored per-operation via a side map
const DELIVERY_ADDRESSES: Record<string, string> = {
  "dely-1": "14, Cyber Towers, Hitech City, Hyderabad – 500081",
  "dely-2": "Plot 22, MIDC Industrial Area, Pune – 411019",
  "dely-3": "Tower B, DLF Cyber City, Gurugram – 122002",
  "dely-4": "No. 5, Residency Road, Bengaluru – 560025",
  "dely-5": "Andheri East, SEEPZ, Mumbai – 400093",
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

export default function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const op = MOCK_DELIVERIES.find((d) => d.id === id);

  if (!op) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Delivery <span className="font-mono">{id}</span> not found.
      </div>
    );
  }

  const deliveryAddress = DELIVERY_ADDRESSES[op.id] ?? "Address not recorded";

  const handleValidate = () => alert(`[MOCK] Validate ${op.referenceCode}`);
  const handlePrint    = () => alert(`[MOCK] Print ${op.referenceCode}`);
  const handleCancel   = () => alert(`[MOCK] Cancel ${op.referenceCode}`);

  const isDone      = op.status === "DONE";
  const isCancelled = op.status === "CANCELLED";

  return (
    <div>
      <OperationPageHeader
        title={op.referenceCode}
        subtitle="Delivery Order"
        actions={
          <button
            id="delivery-back"
            onClick={() => navigate("/operations/deliveries")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      {/* Status pipeline */}
      <div className="mb-6">
        <StatusPipeline operationType="DELIVERY" status={op.status} />
      </div>

      {/* Action bar */}
      {!isDone && !isCancelled && (
        <div className="flex items-center gap-2 mb-6">
          <button
            id="delivery-validate"
            onClick={handleValidate}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-md transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Validate
          </button>
          <button
            id="delivery-print"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-sm rounded-md hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            id="delivery-cancel"
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
          <button
            id="delivery-print-done"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-sm rounded-md hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      )}

      {/* Detail card */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
          <Field label="Reference"       value={op.referenceCode} />
          <div>
            <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
              Status
            </dt>
            <dd>
              <StatusBadge status={op.status} />
            </dd>
          </div>
          <Field label="Contact"         value={op.partner?.name} />
          <Field label="Operation Type"  value="Delivery Order" />
          <Field label="Warehouse"       value={op.referenceWarehouse.name} />
          <Field label="Responsible"     value={op.responsibleUser?.name} />
          <Field
            label="Scheduled Date"
            value={
              op.scheduledAt
                ? new Date(op.scheduledAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : undefined
            }
          />
          {op.completedAt && (
            <Field
              label="Completed Date"
              value={new Date(op.completedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
          )}
          <div className="col-span-2 md:col-span-3">
            <Field label="Delivery Address" value={deliveryAddress} />
          </div>
          {op.notes && (
            <div className="col-span-2 md:col-span-3">
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
                Notes
              </dt>
              <dd className="text-sm text-slate-700">{op.notes}</dd>
            </div>
          )}
        </div>

        {/* Product lines */}
        <div className="p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Product Lines
          </h2>
          <LineItemsTable lines={op.lines} showLocations={true} />
        </div>
      </div>
    </div>
  );
}
