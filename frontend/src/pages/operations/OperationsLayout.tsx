// ── Shared layout wrapper for all Operations pages ──────────────────────────
// Provides the left nav sidebar + main content area.
// Does NOT modify App.tsx (boundary rule).

import { NavLink, Outlet } from "react-router-dom";
import { Inbox, Truck, ArrowLeftRight, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/operations/receipts",    label: "Receipts",    Icon: Inbox           },
  { to: "/operations/deliveries",  label: "Deliveries",  Icon: Truck           },
  { to: "/operations/transfers",   label: "Transfers",   Icon: ArrowLeftRight  },
  { to: "/operations/adjustments", label: "Adjustments", Icon: ClipboardList   },
];

export default function OperationsLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 print:bg-white print:block print:min-h-0">
      {/* ── Sidebar ── */}
      <aside className="w-52 shrink-0 border-r border-slate-200 bg-white flex flex-col print:hidden">
        {/* Brand strip */}
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center gap-2">
          <div className="w-5 h-5 bg-brand-500 rounded" aria-hidden="true" />
          <span className="text-sm font-semibold text-slate-800 tracking-tight">
            StockSense
          </span>
        </div>

        {/* Section label */}
        <div className="px-4 pt-4 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Operations
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 px-2 pb-4">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Back to home */}
        <div className="mt-auto border-t border-slate-200 px-2 py-3">
          <NavLink
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            ← Home
          </NavLink>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto print:overflow-visible">
        <div className="max-w-[1400px] mx-auto px-6 py-6 print:p-0 print:max-w-full print:m-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
