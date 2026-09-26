import React from 'react';
import { cn } from '@/lib/utils';

interface TopBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TopBar({ className, ...props }: TopBarProps) {
  return (
    <header
      className={cn(
        'h-14 border-b bg-surface flex items-center px-4 md:px-6 shrink-0',
        className
      )}
      {...props}
    >
      <div className="flex-1 flex items-center">
        {/* Placeholder for global search or breadcrumbs */}
        <div className="hidden md:flex text-sm text-text-muted">
          Type <kbd className="mx-1 border rounded px-1.5 font-mono text-[10px] bg-surface-muted text-text-secondary">Ctrl K</kbd> to search...
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Placeholder for user profile / notifications */}
        <div className="w-8 h-8 rounded-full bg-surface-muted border flex items-center justify-center text-text-secondary text-sm font-medium">
          JD
        </div>
      </div>
    </header>
  );
}
