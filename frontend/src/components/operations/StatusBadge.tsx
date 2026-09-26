import type { OperationStatus } from "@/features/operations/types";
import { cn } from "@/lib/utils";

// ── Status badge styling ─────────────────────────────────────────────────────
// Rules:
//   Draft     → slate
//   Waiting   → amber
//   Ready     → neutral outlined (NO blue)
//   Done      → green
//   Cancelled → muted red
const STATUS_STYLES: Record<OperationStatus, string> = {
  DRAFT:     "bg-slate-100 text-slate-600 border border-slate-200",
  WAITING:   "bg-amber-50  text-amber-700 border border-amber-200",
  READY:     "bg-white     text-neutral-600 border border-neutral-300",
  DONE:      "bg-green-50  text-green-700 border border-green-200",
  CANCELLED: "bg-red-50    text-red-600   border border-red-200",
};

const STATUS_LABEL: Record<OperationStatus, string> = {
  DRAFT:     "Draft",
  WAITING:   "Waiting",
  READY:     "Ready",
  DONE:      "Done",
  CANCELLED: "Cancelled",
};

interface Props {
  status: OperationStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
