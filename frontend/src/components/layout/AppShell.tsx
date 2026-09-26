import React from 'react';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
