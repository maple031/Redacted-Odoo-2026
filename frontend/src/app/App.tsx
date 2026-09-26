import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'

import OperationsLayout from '../pages/operations/OperationsLayout'
import ReceiptsPage from '../pages/operations/ReceiptsPage'
import ReceiptDetailPage from '../pages/operations/ReceiptDetailPage'
import DeliveryPage from '../pages/operations/DeliveryPage'
import DeliveryDetailPage from '../pages/operations/DeliveryDetailPage'
import TransfersPage from '../pages/operations/TransfersPage'
import AdjustmentPage from '../pages/operations/AdjustmentPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/operations" element={<OperationsLayout />}>
        <Route path="receipts" element={<ReceiptsPage />} />
        <Route path="receipts/:id" element={<ReceiptDetailPage />} />
        <Route path="deliveries" element={<DeliveryPage />} />
        <Route path="deliveries/:id" element={<DeliveryDetailPage />} />
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="adjustments" element={<AdjustmentPage />} />
        {/* Placeholder detail pages for transfers and adjustments */}
        <Route path="transfers/:id" element={<div>Transfer Detail (Mock)</div>} />
        <Route path="adjustments/:id" element={<div>Adjustment Detail (Mock)</div>} />
      </Route>
    </Routes>
  )
}
