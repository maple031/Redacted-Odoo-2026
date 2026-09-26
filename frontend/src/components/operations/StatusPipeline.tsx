import type { OperationStatus, OperationType } from "@/features/operations/types";
import { cn } from "@/lib/utils";

// ── Pipeline definitions per type ────────────────────────────────────────────
const PIPELINE: Record<OperationType, OperationStatus[]> = {
  RECEIPT:    ["DRAFT", "READY", "DONE"],
  DELIVERY:   ["DRAFT", "WAITING", "READY", "DONE"],
  TRANSFER:   ["DRAFT", "WAITING", "READY", "DONE"],
  ADJUSTMENT: ["DRAFT", "READY", "DONE"],
};

const STATUS_LABEL: Record<OperationStatus, string> = {
  DRAFT:     "Draft",
  WAITING:   "Waiting",
  READY:     "Ready",
  DONE:      "Done",
  CANCELLED: "Cancelled",
};

// ── Dot colours (no primary blue for Ready) ──────────────────────────────────
const dotClass = (s: OperationStatus, active: boolean, past: boolean) => {
  if (!active && !past) return "bg-slate-200 border-slate-300";
  const map: Record<OperationStatus, string> = {
    DRAFT:     "bg-slate-400 border-slate-500",
    WAITING:   "bg-amber-400 border-amber-500",
    READY:     "bg-neutral-400 border-neutral-500",
    DONE:      "bg-green-500 border-green-600",
    CANCELLED: "bg-red-400 border-red-500",
  };
  if (past) return "bg-green-400 border-green-500";
  return map[s];
};

interface Props {
  operationType: OperationType;
  status: OperationStatus;
}

export default function StatusPipeline({ operationType, status }: Props) {
  const isCancelled = status === "CANCELLED";
  const steps = isCancelled
    ? [...PIPELINE[operationType], "CANCELLED" as OperationStatus]
    : PIPELINE[operationType];

  const activeIdx = steps.indexOf(status);

  return (
    <div className="flex items-center gap-0" aria-label="Operation status pipeline">
      {steps.map((step, idx) => {
        const isActive = idx === activeIdx;
        const isPast   = idx < activeIdx;
        const isLast   = idx === steps.length - 1;

        return (
          <div key={step} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-3 h-3 rounded-full border",
                  dotClass(step, isActive, isPast),
                  isActive && "ring-2 ring-offset-1 ring-slate-300"
                )}
                aria-current={isActive ? "step" : undefined}
              />
              <span
                className={cn(
                  "text-[11px] leading-none whitespace-nowrap",
                  isActive  ? "text-slate-700 font-semibold" : "",
                  isPast    ? "text-slate-400"                : "",
                  !isActive && !isPast ? "text-slate-300"    : ""
                )}
              >
                {STATUS_LABEL[step]}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={cn(
                  "h-px w-10 mx-1 mb-4",
                  isPast ? "bg-green-400" : "bg-slate-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
