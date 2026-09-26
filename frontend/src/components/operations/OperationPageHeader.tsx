import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function OperationPageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-200 mb-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
