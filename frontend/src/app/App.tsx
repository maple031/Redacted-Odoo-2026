import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import OperationsLayout from '../pages/operations/OperationsLayout'
import ReceiptsPage from '../pages/operations/ReceiptsPage'
import ReceiptDetailPage from '../pages/operations/ReceiptDetailPage'
import DeliveryPage from '../pages/operations/DeliveryPage'
import DeliveryDetailPage from '../pages/operations/DeliveryDetailPage'
import TransfersPage from '../pages/operations/TransfersPage'
import TransferDetailPage from '../pages/operations/TransferDetailPage'
import AdjustmentPage from '../pages/operations/AdjustmentPage'
import AdjustmentDetailPage from '../pages/operations/AdjustmentDetailPage'
import StockProductsPage from '../pages/StockProductsPage'
import MoveHistoryPage from '../pages/MoveHistoryPage'
import SettingsPage from '../pages/settings/SettingsPage'
import WarehousesPage from '../pages/settings/WarehousesPage'
import LocationsPage from '../pages/settings/LocationsPage'
import { AuthProvider } from '../lib/auth/AuthContext'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public / Auth routes ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* ── Protected routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stock" element={<StockProductsPage />} />
          <Route path="/history" element={<MoveHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/warehouses" element={<WarehousesPage />} />
          <Route path="/settings/locations" element={<LocationsPage />} />
          
          <Route path="/operations" element={<OperationsLayout />}>
            <Route index element={<Navigate to="receipts" replace />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="receipts/:id" element={<ReceiptDetailPage />} />
            <Route path="deliveries" element={<DeliveryPage />} />
            <Route path="deliveries/:id" element={<DeliveryDetailPage />} />
            <Route path="transfers" element={<TransfersPage />} />
            <Route path="transfers/:id" element={<TransferDetailPage />} />
            <Route path="adjustments" element={<AdjustmentPage />} />
            <Route path="adjustments/:id" element={<AdjustmentDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
