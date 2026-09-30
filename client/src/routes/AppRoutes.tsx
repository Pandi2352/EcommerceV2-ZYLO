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
import ComingSoonPage from '../pages/common/ComingSoonPage';

interface PlannedRoute {
  path: string;
  title: string;
}

// Planned pages that are linked from the UI but not built yet. Replace an
// entry with a real <Route> when its page is implemented.
const customerPublicPlanned: PlannedRoute[] = [
  { path: ROUTES.CUSTOMER.SHOP, title: 'Shop' },
  { path: ROUTES.CUSTOMER.PRODUCT_DETAILS, title: 'Product Details' },
  { path: ROUTES.CUSTOMER.VENDORS, title: 'Vendors' },
  { path: ROUTES.CUSTOMER.PAGES, title: 'Pages' },
  { path: ROUTES.CUSTOMER.BLOG, title: 'Blog' },
  { path: ROUTES.CUSTOMER.CONTACT, title: 'Contact Us' },
  { path: ROUTES.CUSTOMER.ABOUT, title: 'About Us' },
  { path: ROUTES.CUSTOMER.CAREERS, title: 'Careers' },
  { path: ROUTES.CUSTOMER.TERMS, title: 'Terms & Conditions' },
  { path: ROUTES.CUSTOMER.OPEN_SHOP, title: 'Open a Shop' },
  { path: ROUTES.CUSTOMER.COMPARE, title: 'Compare Products' },
  { path: ROUTES.CUSTOMER.CART, title: 'Shopping Cart' },
];

const customerAccountPlanned: PlannedRoute[] = [
  { path: ROUTES.CUSTOMER.DASHBOARD, title: 'My Account' },
  { path: ROUTES.CUSTOMER.ORDERS, title: 'My Orders' },
  { path: ROUTES.CUSTOMER.PROFILE, title: 'My Profile' },
  { path: ROUTES.CUSTOMER.ADDRESSES, title: 'My Addresses' },
  { path: ROUTES.CUSTOMER.WISHLIST, title: 'Wishlist' },
  { path: ROUTES.CUSTOMER.CHECKOUT, title: 'Checkout' },
];

const adminPlanned: PlannedRoute[] = [
  { path: ROUTES.ADMIN.PRODUCTS, title: 'Products' },
  { path: ROUTES.ADMIN.CATEGORIES, title: 'Categories' },
  { path: ROUTES.ADMIN.ORDERS, title: 'Orders' },
  { path: ROUTES.ADMIN.CUSTOMERS, title: 'Customers' },
  { path: ROUTES.ADMIN.ANALYTICS, title: 'Analytics' },
  { path: ROUTES.ADMIN.SETTINGS, title: 'Settings' },
];

const renderPlanned = (routes: PlannedRoute[], backTo: string, backLabel: string) =>
  routes.map(({ path, title }) => (
    <Route
      key={path}
      path={path}
      element={<ComingSoonPage title={title} backTo={backTo} backLabel={backLabel} />}
    />
  ));

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
      {/* 1. CUSTOMER STOREFRONT — home keeps the category rail */}
      <Route element={<CustomerLayout />}>
        <Route path={ROUTES.CUSTOMER.HOME} element={<CustomerHomePage />} />
      </Route>

      {/* 2. CUSTOMER INNER PAGES (no category rail) + storefront 404 */}
      <Route element={<CustomerLayout showRail={false} />}>
        {renderPlanned(customerPublicPlanned, ROUTES.CUSTOMER.HOME, 'Back to Home')}

        <Route element={<ProtectedRoute />}>
          {renderPlanned(customerAccountPlanned, ROUTES.CUSTOMER.HOME, 'Back to Home')}
        </Route>

        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Route>

      {/* 3. CUSTOMER AUTHENTICATION (pages render their own layout) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.CUSTOMER.REGISTER} element={<CustomerRegisterPage />} />
        <Route path={ROUTES.CUSTOMER.LOGIN} element={<CustomerLoginPage />} />
        {/* Admin portal: sign-in only, admin accounts are never self-registered */}
        <Route path={ROUTES.ADMIN.LOGIN} element={<AdminLoginPage />} />
      </Route>

      {/* 4. ADMIN CONSOLE (role: ADMIN) — every /admin/* URL stays in AdminLayout */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
          {renderPlanned(adminPlanned, ROUTES.ADMIN.DASHBOARD, 'Back to Dashboard')}
          <Route
            path={`${ROUTES.ADMIN.DASHBOARD}/*`}
            element={<NotFoundPage homeTo={ROUTES.ADMIN.DASHBOARD} homeLabel="Back to Dashboard" />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
