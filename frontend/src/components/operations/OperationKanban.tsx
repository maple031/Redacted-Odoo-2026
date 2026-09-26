import React from "react";
import { useNavigate } from "react-router-dom";
import type { InventoryOperation } from "@/features/operations/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Calendar, MapPin, Package } from "lucide-react";

interface CardProps {
  operation: InventoryOperation;
  detailBasePath: string;
}

export function OperationCard({ operation: op, detailBasePath }: CardProps) {
  const navigate = useNavigate();

  const firstSrc  = op.lines[0]?.sourceLocation?.name;
  const firstDest = op.lines[0]?.destinationLocation?.name;
  const locationLabel =
    firstSrc && firstDest
      ? `${firstSrc} → ${firstDest}`
      : firstSrc ?? firstDest ?? op.referenceWarehouse.name;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ id: op.id, currentStatus: op.status }));
    e.dataTransfer.effectAllowed = "move";
    // Slightly fade the card while dragging
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).style.opacity = "1";
  };

  return (
    <div
      onClick={() => navigate(`${detailBasePath}/${op.id}`)}
      className="bg-white border border-slate-200 rounded-md p-3 cursor-pointer hover:shadow-sm hover:border-slate-300 transition-all"
      role="button"
      aria-label={`Open ${op.referenceCode}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono text-xs font-semibold text-brand-600 leading-tight">
          {op.referenceCode}
        </span>
        <StatusBadge status={op.status} />
      </div>

      {/* Partner */}
      {op.partner && (
        <p className="text-xs text-slate-600 mb-1.5 truncate">{op.partner.name}</p>
      )}

      {/* Meta row */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Package className="w-3 h-3 shrink-0" />
          <span className="tabular-nums">{op.lines.length} item{op.lines.length !== 1 ? "s" : ""}</span>
        </div>
        {locationLabel && (
          <div className="flex items-center gap-1 text-xs text-slate-400 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{locationLabel}</span>
          </div>
        )}
        {op.scheduledAt && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3 h-3 shrink-0" />
            <span className="tabular-nums">
              {new Date(op.scheduledAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Column ───────────────────────────────────────────────────────────────────
interface ColumnProps {
  title: string;
  count: number;
  operations: InventoryOperation[];
  detailBasePath: string;
  status: OperationStatus;
  onDrop: (operationId: string, newStatus: OperationStatus) => void;
}

export function OperationKanbanColumn({
  title,
  count,
  operations,
  detailBasePath,
  status,
  onDrop,
}: ColumnProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data && data.id && data.currentStatus !== status) {
        onDrop(data.id, status);
      }
    } catch (err) {
      // Ignore if data is not our JSON
    }
  };

  return (
    // NO coloured column backgrounds — plain neutral bg per spec
    <div
      className="flex flex-col min-w-[220px] w-56 shrink-0 rounded-md transition-colors"
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {title}
        </span>
        <span className="text-xs tabular-nums bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 flex-1 min-h-[100px]">
        {operations.length === 0 && (
          <div className="border border-dashed border-slate-200 rounded-md py-6 text-center text-xs text-slate-300 pointer-events-none">
            Empty
          </div>
        )}
        {operations.map((op) => (
          <OperationCard
            key={op.id}
            operation={op}
            detailBasePath={detailBasePath}
          />
        ))}
      </div>
    </div>
  );
}

// ── Board ────────────────────────────────────────────────────────────────────
import type { OperationStatus, OperationType } from "@/features/operations/types";

const PIPELINE_STATUSES: Record<OperationType, OperationStatus[]> = {
  RECEIPT:    ["DRAFT", "READY", "DONE"],
  DELIVERY:   ["DRAFT", "WAITING", "READY", "DONE"],
  TRANSFER:   ["DRAFT", "WAITING", "READY", "DONE"],
  ADJUSTMENT: ["DRAFT", "READY", "DONE"],
};

const STATUS_LABEL: Partial<Record<OperationStatus, string>> = {
  DRAFT:   "Draft",
  WAITING: "Waiting",
  READY:   "Ready",
  DONE:    "Done",
};

interface BoardProps {
  operations: InventoryOperation[];
  operationType: OperationType;
  detailBasePath: string;
  onStatusChange?: (operationId: string, newStatus: OperationStatus) => void;
}

export default function OperationKanban({
  operations,
  operationType,
  detailBasePath,
  onStatusChange,
}: BoardProps) {
  const statuses = PIPELINE_STATUSES[operationType];

  const handleDrop = (operationId: string, newStatus: OperationStatus) => {
    // Basic validation: Is the status valid for this operation type?
    if (statuses.includes(newStatus) && onStatusChange) {
      onStatusChange(operationId, newStatus);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const cols = operations.filter((op) => op.status === status);
        return (
          <OperationKanbanColumn
            key={status}
            status={status}
            title={STATUS_LABEL[status] ?? status}
            count={cols.length}
            operations={cols}
            detailBasePath={detailBasePath}
            onDrop={handleDrop}
          />
        );
      })}
    </div>
  );
}
