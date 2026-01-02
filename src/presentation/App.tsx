import React from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { OrderListPage } from './order/pages/OrderListPage';
import { ProductListPage } from './product/pages/ProductListPage';
import { Navigation } from './shared/components/Navigation';
import { UserListPage } from './user/pages/UserListPage';

import './shared/styles/app.css';

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="mx-auto max-w-7xl py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/users" replace />} />
            <Route path="/users" element={<UserListPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/orders" element={<OrderListPage />} />
          </Routes>
        </main>
        <Toaster position="top-right" richColors closeButton />
      </div>
    </BrowserRouter>
  );
}

export default App;

