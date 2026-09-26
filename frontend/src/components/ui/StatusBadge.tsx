import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'DRAFT' 
  | 'WAITING' 
  | 'READY' 
  | 'DONE' 
  | 'CANCELLED' 
  | 'IN_STOCK' 
  | 'LOW_STOCK' 
  | 'OUT_OF_STOCK' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'PENDING';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case 'DONE':
      case 'IN_STOCK':
      case 'SUCCESS':
        return 'bg-success-bg text-success border-success-border';
      case 'WAITING':
      case 'LOW_STOCK':
      case 'PENDING':
        return 'bg-warning-bg text-warning border-warning-border';
      case 'FAILED':
      case 'OUT_OF_STOCK':
      case 'CANCELLED':
        return 'bg-danger-bg text-danger border-danger-border';
      case 'DRAFT':
        return 'bg-draft-bg text-draft border-draft-border';
      case 'READY':
        return 'bg-ready-bg text-ready border-ready-border';
      default:
        return 'bg-ready-bg text-ready border-ready-border';
    }
  };

  const getStatusLabel = (status: StatusType) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        getStatusStyles(status),
        className
      )}
      {...props}
    >
      {getStatusLabel(status)}
    </div>
  );
}
