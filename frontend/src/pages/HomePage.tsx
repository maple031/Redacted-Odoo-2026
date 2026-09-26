import { useHealth } from '../hooks/useHealth'

export default function HomePage() {
  const { data, isPending, isError, error } = useHealth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-7 h-7 bg-brand-500 rounded" aria-hidden="true" />
          <span className="text-lg font-semibold text-slate-900 tracking-tight">
            StockSense
          </span>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full space-y-8">

          {/* Hero copy */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Inventory, managed.
            </h1>
            <p className="mt-2 text-slate-500">
              StockSense scaffold is live. The card below confirms end-to-end
              connectivity through the Vite proxy to the Spring Boot backend.
            </p>
          </div>

          {/* Health card */}
          <div className="border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">

            <div className="px-5 py-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Backend health
              </h2>
            </div>

            <div className="px-5 py-4">
              {isPending && (
                <div className="flex items-center gap-2.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
                  <span className="text-sm text-slate-500">Connecting…</span>
                </div>
              )}

              {isError && (
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Unreachable</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      {error instanceof Error ? error.message : 'Unknown error'}
                    </p>
                  </div>
                </div>
              )}

              {data && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-700">Connected</span>
                  </div>
                  <pre className="text-xs font-mono bg-slate-50 border border-slate-200 rounded p-3 text-slate-700 overflow-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href="/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 font-medium hover:text-brand-700 hover:underline"
            >
              Swagger UI →
            </a>
            <span className="text-slate-300">|</span>
            <a
              href="/actuator/health"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 font-medium hover:text-brand-700 hover:underline"
            >
              Actuator health →
            </a>
          </div>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-3 text-xs text-slate-400">
          StockSense · initial scaffold commit
        </div>
      </footer>

    </div>
  )
}
