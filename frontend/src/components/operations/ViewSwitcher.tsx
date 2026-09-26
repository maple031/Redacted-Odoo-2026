import { List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "kanban";

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewSwitcher({ mode, onChange }: Props) {
  return (
    <div
      className="inline-flex items-center border border-slate-200 rounded-md overflow-hidden"
      role="group"
      aria-label="View switcher"
    >
      <button
        id="view-list"
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm",
          mode === "list"
            ? "bg-brand-500 text-white"
            : "bg-white text-slate-500 hover:bg-slate-50"
        )}
        aria-pressed={mode === "list"}
      >
        <List className="w-3.5 h-3.5" />
        List
      </button>
      <button
        id="view-kanban"
        onClick={() => onChange("kanban")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm border-l border-slate-200",
          mode === "kanban"
            ? "bg-brand-500 text-white"
            : "bg-white text-slate-500 hover:bg-slate-50"
        )}
        aria-pressed={mode === "kanban"}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Kanban
      </button>
    </div>
  );
}
