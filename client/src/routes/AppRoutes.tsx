import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from './routePaths';
import PageLoader from '../components/common/PageLoader';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

// Layout Outlets
import CustomerLayout from '../components/layout/CustomerLayout';
import AdminLayout from '../components/layout/admin/AdminLayout';

// Pages
import CustomerHomePage from '../pages/customer/HomePage';
import CustomerRegisterPage from '../pages/customer/RegisterPage';
import CustomerLoginPage from '../pages/customer/LoginPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import NotFoundPage from '../pages/common/NotFoundPage';

export const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  // Show ZYLO mascot page loader while initial session check is resolving
  if (isLoading) {
    return (
      <PageLoader
        variant="mascot"
        size="md"
        text="Loading ZYLO..."
        fullScreen={true}
      />
    );
  }

  return (
    <Routes>
      {/* ========================================================
          1. CUSTOMER STOREFRONT (With CustomerLayout Outlet)
          ======================================================== */}
      <Route element={<CustomerLayout />}>
        <Route path={ROUTES.CUSTOMER.HOME} element={<CustomerHomePage />} />
        {/* Future Storefront Pages: /shop, /vendors, etc. */}
      </Route>

      {/* ========================================================
          2. CUSTOMER AUTHENTICATION (Customer-Only Registration)
          ======================================================== */}
      <Route
        path={ROUTES.CUSTOMER.REGISTER}
        element={
          <PublicOnlyRoute>
            <CustomerRegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path={ROUTES.CUSTOMER.LOGIN}
        element={
          <PublicOnlyRoute>
            <CustomerLoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* ========================================================
          3. ADMIN PORTAL AUTHENTICATION (Strictly No Registration)
          ======================================================== */}
      <Route
        path={ROUTES.ADMIN.LOGIN}
        element={
          <PublicOnlyRoute>
            <AdminLoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* ========================================================
          4. ADMIN PROTECTED ROUTES (Role: ADMIN + AdminLayout Outlet)
          ======================================================== */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
          {/* Future Admin Pages: /admin/products, /admin/orders, etc. */}
        </Route>
      </Route>

      {/* ========================================================
          5. FALLBACK / 404 NOT FOUND
          ======================================================== */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
