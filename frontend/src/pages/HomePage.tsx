import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { PageHeader } from '../components/layout/PageHeader'
import { MOCK_RECEIPTS, MOCK_DELIVERIES } from '../features/operations/mockData'

export default function HomePage() {
  const navigate = useNavigate()

  // Dynamic calculations for Receipts
  const pendingReceipts = MOCK_RECEIPTS.filter(r => r.status === 'READY' || r.status === 'DRAFT').length
  const lateReceipts = MOCK_RECEIPTS.filter(r => new Date(r.scheduledAt) < new Date() && r.status !== 'DONE').length
  const totalReceipts = MOCK_RECEIPTS.length

  // Dynamic calculations for Deliveries
  const pendingDeliveries = MOCK_DELIVERIES.filter(d => d.status === 'READY' || d.status === 'DRAFT').length
  const waitingDeliveries = MOCK_DELIVERIES.filter(d => d.status === 'WAITING').length
  const lateDeliveries = MOCK_DELIVERIES.filter(d => new Date(d.scheduledAt) < new Date() && d.status !== 'DONE').length
  const totalDeliveries = MOCK_DELIVERIES.length

  return (
    <AppShell>
      <PageHeader 
        title="StockSense" 
        description="Inventory operations platform" 
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Receipts Card */}
        <div 
          onClick={() => navigate('/operations/receipts')}
          className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow hover:border-brand-300"
        >
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="tracking-tight text-lg font-semibold">Receipts</h3>
          </div>
          <div className="p-6 pt-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{pendingReceipts} to receive</span>
            </div>
            {lateReceipts > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[--danger,#B91C1C] font-medium">{lateReceipts} Late</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{totalReceipts} operations</span>
            </div>
          </div>
        </div>

        {/* Delivery Card */}
        <div 
          onClick={() => navigate('/operations/deliveries')}
          className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow hover:border-brand-300"
        >
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="tracking-tight text-lg font-semibold">Delivery Orders</h3>
          </div>
          <div className="p-6 pt-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{pendingDeliveries} to Deliver</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{waitingDeliveries} waiting</span>
            </div>
            {lateDeliveries > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[--danger,#B91C1C] font-medium">{lateDeliveries} Late</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{totalDeliveries} operations</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

