import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6", className)} {...props}>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
