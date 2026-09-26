import React from 'react';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';

interface TopBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TopBar({ className, ...props }: TopBarProps) {
  const { user, logout } = useAuth();
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Operations', path: '/operations' },
    { name: 'Stock / Products', path: '/stock' },
    { name: 'Move History', path: '/history' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <header
      className={cn(
        'h-14 border-b bg-surface flex items-center px-4 md:px-6 shrink-0 gap-6',
        className
      )}
      {...props}
    >
      <div className="font-semibold text-lg text-primary mr-4 flex items-center">
        StockSense
      </div>
      <nav className="flex-1 flex items-center gap-6 overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'text-sm font-medium transition-colors hover:text-primary whitespace-nowrap',
                isActive ? 'text-primary' : 'text-text-secondary'
              )
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center gap-4 ml-auto">
        <div className="relative hidden md:flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="search"
            placeholder="Search operations, products..."
            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 pl-8 pr-4 lg:w-[300px]"
          />
        </div>
        <div className="relative group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 border border-brand-200 flex items-center justify-center text-sm font-semibold hover:bg-brand-200 transition-colors uppercase">
            {user?.loginId?.substring(0, 2) || 'JD'}
          </div>
          <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-800">{user?.loginId || 'Guest User'}</p>
              <p className="text-xs text-slate-500">{user?.email || 'Not logged in'}</p>
            </div>
            <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
