import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';

import SupplierDashboardPage from './pages/supplier/DashboardPage';
import SupplierProductsPage from './pages/supplier/ProductsPage';
import SupplierBalancePage from './pages/supplier/BalancePage';
import SupplierAppointmentsPage from './pages/supplier/AppointmentsPage';
import SupplierReturnsPage from './pages/supplier/ReturnsPage';

import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminSuppliersPage from './pages/admin/SuppliersPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminSalesPage from './pages/admin/SalesPage';
import AdminAppointmentsPage from './pages/admin/AppointmentsPage';
import AdminBalancePage from './pages/admin/BalancePage';
import AdminReturnsPage from './pages/admin/ReturnsPage';

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'ADMIN' ? '/admin' : '/supplier'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          <Route path="/supplier" element={<ProtectedRoute requiredRole="PROVEEDOR"><SupplierDashboardPage /></ProtectedRoute>} />
          <Route path="/supplier/products" element={<ProtectedRoute requiredRole="PROVEEDOR"><SupplierProductsPage /></ProtectedRoute>} />
          <Route path="/supplier/balance" element={<ProtectedRoute requiredRole="PROVEEDOR"><SupplierBalancePage /></ProtectedRoute>} />
          <Route path="/supplier/appointments" element={<ProtectedRoute requiredRole="PROVEEDOR"><SupplierAppointmentsPage /></ProtectedRoute>} />
          <Route path="/supplier/returns" element={<ProtectedRoute requiredRole="PROVEEDOR"><SupplierReturnsPage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/suppliers" element={<ProtectedRoute requiredRole="ADMIN"><AdminSuppliersPage /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute requiredRole="ADMIN"><AdminProductsPage /></ProtectedRoute>} />
          <Route path="/admin/sales" element={<ProtectedRoute requiredRole="ADMIN"><AdminSalesPage /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute requiredRole="ADMIN"><AdminAppointmentsPage /></ProtectedRoute>} />
          <Route path="/admin/balance" element={<ProtectedRoute requiredRole="ADMIN"><AdminBalancePage /></ProtectedRoute>} />
          <Route path="/admin/returns" element={<ProtectedRoute requiredRole="ADMIN"><AdminReturnsPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
