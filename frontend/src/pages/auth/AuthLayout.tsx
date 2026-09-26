import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  /** Page title rendered inside the card header */
  title: string
  /** Subtitle / description beneath the title */
  subtitle: string
  children: ReactNode
}

/**
 * Shared wrapper for all four auth pages.
 *
 * Intentionally does NOT use AppShell, Sidebar, or TopBar — auth pages
 * are outside the authenticated application shell.
 *
 * Tokens used:
 *   bg-background  → #F8FAFC
 *   bg-card        → #FFFFFF
 *   border-border  → #E2E8F0
 */
export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">

      {/* ── Brand ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-8 select-none">
        <div
          className="w-7 h-7 rounded bg-primary flex items-center justify-center"
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" fill="white" className="w-4 h-4">
            <rect x="2" y="2" width="5" height="5" rx="1" />
            <rect x="9" y="2" width="5" height="5" rx="1" />
            <rect x="2" y="9" width="5" height="5" rx="1" />
            <rect x="9" y="9" width="5" height="5" rx="1" />
          </svg>
        </div>
        <Link to="/" className="text-lg font-semibold text-foreground tracking-tight">
          StockSense
        </Link>
      </div>

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-sm">

        {/* Card header */}
        <div className="px-8 pt-8 pb-6 border-b border-border">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* Card body */}
        <div className="px-8 py-6">
          {children}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <p className="mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} StockSense. All rights reserved.
      </p>
    </div>
  )
}
