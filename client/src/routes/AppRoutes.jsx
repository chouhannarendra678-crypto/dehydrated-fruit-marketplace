import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import SellerLayout from '../layouts/SellerLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import SellerRoute from './SellerRoute';
import AdminRoute from './AdminRoute';

// Customer Pages
import HomePage from '../pages/customer/HomePage';
import ExploreFruitsPage from '../pages/customer/ExploreFruitsPage';
import ProductDetailsPage from '../pages/customer/ProductDetailsPage';
import SellerStorePage from '../pages/customer/SellerStorePage';
import SellWithUsPage from '../pages/customer/SellWithUsPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrdersPage from '../pages/customer/OrdersPage';
import OrderDetailsPage from '../pages/customer/OrderDetailsPage';
import WishlistPage from '../pages/customer/WishlistPage';
import ProfilePage from '../pages/customer/ProfilePage';

// Seller Pages
import SellerDashboardPage from '../pages/seller/SellerDashboardPage';
import SellerProductsPage from '../pages/seller/SellerProductsPage';
import SellerOrdersPage from '../pages/seller/SellerOrdersPage';
import SellerInventoryPage from '../pages/seller/SellerInventoryPage';
import SellerEarningsPage from '../pages/seller/SellerEarningsPage';
import SellerPayoutsPage from '../pages/seller/SellerPayoutsPage';
import SellerReviewsPage from '../pages/seller/SellerReviewsPage';
import SellerStoreProfilePage from '../pages/seller/SellerStoreProfilePage';
import SellerSettingsPage from '../pages/seller/SellerSettingsPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminSellersPage from '../pages/admin/AdminSellersPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminPayoutsPage from '../pages/admin/AdminPayoutsPage';
import AdminCommissionsPage from '../pages/admin/AdminCommissionsPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import SellerRegisterPage from '../pages/auth/SellerRegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Common
import NotFoundPage from '../pages/common/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Customer Pages in CustomerLayout */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExploreFruitsPage />} />
        <Route path="/brands" element={<ExploreFruitsPage defaultTab="brands" />} />
        <Route path="/sellers" element={<ExploreFruitsPage defaultTab="brands" />} />
        <Route path="/sell-with-us" element={<SellWithUsPage />} />
        <Route path="/products/:slug" element={<ProductDetailsPage />} />
        <Route path="/sellers/:slug" element={<SellerStorePage />} />
        <Route path="/categories/:slug" element={<ExploreFruitsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />

        {/* Customer Protected Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth Routes in AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/seller/register" element={<SellerRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Seller Portal in SellerLayout */}
      <Route
        path="/seller"
        element={
          <SellerRoute>
            <SellerLayout />
          </SellerRoute>
        }
      >
        <Route index element={<SellerDashboardPage />} />
        <Route path="dashboard" element={<SellerDashboardPage />} />
        <Route path="products" element={<SellerProductsPage />} />
        <Route path="orders" element={<SellerOrdersPage />} />
        <Route path="inventory" element={<SellerInventoryPage />} />
        <Route path="earnings" element={<SellerEarningsPage />} />
        <Route path="payouts" element={<SellerPayoutsPage />} />
        <Route path="reviews" element={<SellerReviewsPage />} />
        <Route path="store-profile" element={<SellerStoreProfilePage />} />
        <Route path="settings" element={<SellerSettingsPage />} />
      </Route>

      {/* Admin Console in AdminLayout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="sellers" element={<AdminSellersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="payouts" element={<AdminPayoutsPage />} />
        <Route path="commissions" element={<AdminCommissionsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

