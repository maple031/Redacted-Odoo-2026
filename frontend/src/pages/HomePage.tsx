import { useHealth } from '../features/health/useHealth'
import { AppShell } from '../components/layout/AppShell'
import { PageHeader } from '../components/layout/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'

export default function HomePage() {
  const { data, isPending, isError } = useHealth()

  return (
    <AppShell>
      <PageHeader 
        title="StockSense" 
        description="Inventory operations platform" 
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Backend Service</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">StockSense API</span>
              {isPending && <StatusBadge status="PENDING" />}
              {isError && <StatusBadge status="FAILED" />}
              {data && <StatusBadge status="SUCCESS" />}
            </div>
            {data && (
              <pre className="mt-4 text-[10px] font-mono bg-surface-muted border rounded p-2 text-text-secondary overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

