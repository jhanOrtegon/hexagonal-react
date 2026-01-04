import React from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { OrderListPage } from './order/pages/OrderListPage';
import { ProductListPage } from './product/pages/ProductListPage';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { Navigation } from './shared/components/Navigation';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { AuthProvider } from './shared/context/AuthContext';
import { LoginPage } from './user/pages/LoginPage';
import { UserListPage } from './user/pages/UserListPage';

import './shared/styles/app.css';

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <main className="mx-auto max-w-7xl py-6">
                      <Routes>
                        <Route path="/" element={<Navigate to="/users" replace />} />
                        <Route path="/users" element={<UserListPage />} />
                        <Route path="/products" element={<ProductListPage />} />
                        <Route path="/orders" element={<OrderListPage />} />
                      </Routes>
                    </main>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster position="top-right" richColors closeButton />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
