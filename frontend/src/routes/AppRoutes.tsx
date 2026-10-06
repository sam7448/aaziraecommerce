import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

// Customer Pages
import { HomePage } from '../pages/customer/HomePage';
import { ProductListPage } from '../pages/customer/ProductListPage';
import { ProductDetailPage } from '../pages/customer/ProductDetailPage';
import { CartPage } from '../pages/customer/CartPage';
import { WishlistPage } from '../pages/customer/WishlistPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrderSuccessPage } from '../pages/customer/OrderSuccessPage';
import { OrderHistoryPage } from '../pages/customer/OrderHistoryPage';
import { OrderDetailPage } from '../pages/customer/OrderDetailPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';

// Dashboards
import { SellerDashboard } from '../pages/seller/SellerDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';

// 404
import { NotFoundPage } from '../pages/common/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes - Top priority matching */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Customer & Public Storefront */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer" element={<Navigate to="/dashboard" replace />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<CustomerProfilePage />} />

          {/* Seller routes */}
          <Route element={<RoleRoute allowedRoles={['seller', 'admin']} />}>
            <Route path="/seller" element={<SellerDashboard />} />
          </Route>
        </Route>

        {/* 404 Catch-All at the bottom */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
