import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductDetail from './pages/products/ProductDetail';
import ReceiptList from './pages/receipts/ReceiptList';
import ReceiptForm from './pages/receipts/ReceiptForm';
import ReceiptDetail from './pages/receipts/ReceiptDetail';
import DeliveryList from './pages/deliveries/DeliveryList';
import DeliveryForm from './pages/deliveries/DeliveryForm';
import DeliveryDetail from './pages/deliveries/DeliveryDetail';
import TransferList from './pages/transfers/TransferList';
import TransferForm from './pages/transfers/TransferForm';
import TransferDetail from './pages/transfers/TransferDetail';
import AdjustmentList from './pages/adjustments/AdjustmentList';
import AdjustmentForm from './pages/adjustments/AdjustmentForm';
import StockLedger from './pages/ledger/StockLedger';
import WarehouseList from './pages/warehouses/WarehouseList';
import Settings from './pages/settings/Settings';
import Profile from './pages/profile/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes inside Global Layout Shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Products */}
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />

              {/* Receipts */}
              <Route path="/receipts" element={<ReceiptList />} />
              <Route path="/receipts/new" element={<ReceiptForm />} />
              <Route path="/receipts/:id" element={<ReceiptDetail />} />

              {/* Deliveries */}
              <Route path="/deliveries" element={<DeliveryList />} />
              <Route path="/deliveries/new" element={<DeliveryForm />} />
              <Route path="/deliveries/:id" element={<DeliveryDetail />} />

              {/* Transfers */}
              <Route path="/transfers" element={<TransferList />} />
              <Route path="/transfers/new" element={<TransferForm />} />
              <Route path="/transfers/:id" element={<TransferDetail />} />

              {/* Adjustments */}
              <Route path="/adjustments" element={<AdjustmentList />} />
              <Route path="/adjustments/new" element={<AdjustmentForm />} />

              {/* Stock Ledger */}
              <Route path="/ledger" element={<StockLedger />} />

              {/* Management */}
              <Route path="/warehouses" element={<WarehouseList />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
