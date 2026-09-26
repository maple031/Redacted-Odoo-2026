import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        'w-[240px] flex-shrink-0 bg-sidebar text-sidebar-foreground border-r hidden md:flex flex-col',
        className
      )}
      {...props}
    >
      <div className="p-4 font-semibold text-lg border-b border-sidebar-muted">
        StockSense
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        <SidebarItem active>Dashboard</SidebarItem>
        <SidebarSection>Operations</SidebarSection>
        <SidebarItem>Receipts</SidebarItem>
        <SidebarItem>Deliveries</SidebarItem>
        <SidebarItem>Transfers</SidebarItem>
        <SidebarItem>Adjustments</SidebarItem>
        <SidebarSection>Stock / Products</SidebarSection>
        <SidebarItem>Stock</SidebarItem>
        <SidebarItem>Products</SidebarItem>
        <SidebarSection>Move History</SidebarSection>
        <SidebarItem>History</SidebarItem>
        <SidebarSection>Contacts</SidebarSection>
        <SidebarItem>Contacts</SidebarItem>
        <SidebarSection>Settings</SidebarSection>
        <SidebarItem>Warehouses</SidebarItem>
        <SidebarItem>Locations</SidebarItem>
      </nav>
    </aside>
  );
}

function SidebarSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 mt-4 mb-1 text-[11px] font-semibold text-sidebar-muted uppercase tracking-wider">
      {children}
    </div>
  );
}

function SidebarItem({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div
      className={cn(
        'px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground'
      )}
    >
      {children}
    </div>
  );
}
