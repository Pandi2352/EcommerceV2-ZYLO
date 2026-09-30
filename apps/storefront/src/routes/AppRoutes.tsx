import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from './routePaths';
import {
  ADMIN_MANAGER_PLANNED,
  ADMIN_STAFF_PLANNED,
  CUSTOMER_ACCOUNT_PLANNED,
  CUSTOMER_PUBLIC_PLANNED,
  type PlannedRoute,
} from './plannedRoutes';
import { STAFF_ROLES, USER_ROLES } from '../constants/roles';
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
import AccountSecurityPage from '../pages/account/AccountSecurityPage';
import MfaVerifyPage from '../pages/auth/MfaVerifyPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminChangePasswordPage from '../pages/admin/AdminChangePasswordPage';
import AdminSecurityPage from '../pages/admin/AdminSecurityPage';
import AdminAuditLogsPage from '../pages/admin/AdminAuditLogsPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import ComingSoonPage from '../pages/common/ComingSoonPage';

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
    return <PageLoader variant="mascot" size="md" text="Loading ZYLO..." fullScreen={true} />;
  }

  return (
    <Routes>
      {/* 1. CUSTOMER STOREFRONT — home keeps the category rail */}
      <Route element={<CustomerLayout />}>
        <Route path={ROUTES.CUSTOMER.HOME} element={<CustomerHomePage />} />
      </Route>

      {/* 2. CUSTOMER INNER PAGES (no category rail) + storefront 404 */}
      <Route element={<CustomerLayout showRail={false} />}>
        {renderPlanned(CUSTOMER_PUBLIC_PLANNED, ROUTES.CUSTOMER.HOME, 'Back to Home')}

        <Route element={<ProtectedRoute role={USER_ROLES.CUSTOMER} />}>
          <Route path={ROUTES.CUSTOMER.SECURITY} element={<AccountSecurityPage />} />
          {renderPlanned(CUSTOMER_ACCOUNT_PLANNED, ROUTES.CUSTOMER.HOME, 'Back to Home')}
        </Route>

        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Route>

      {/* 3. SIGN-IN PAGES (signed-in users are sent to their portal home) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.CUSTOMER.REGISTER} element={<CustomerRegisterPage />} />
        <Route path={ROUTES.CUSTOMER.LOGIN} element={<CustomerLoginPage />} />
        <Route path={ROUTES.CUSTOMER.LOGIN_VERIFY} element={<MfaVerifyPage portal="customer" />} />
        {/* Admin portal: sign-in only, admin accounts are never self-registered */}
        <Route path={ROUTES.ADMIN.LOGIN} element={<AdminLoginPage />} />
        <Route path={ROUTES.ADMIN.LOGIN_VERIFY} element={<MfaVerifyPage portal="admin" />} />
      </Route>

      {/* 4. EMAILED LINKS (work whether or not the user is signed in) */}
      <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<ResetPasswordPage />} />
      <Route path={ROUTES.AUTH.VERIFY_EMAIL} element={<VerifyEmailPage />} />

      {/* 5. ADMIN CONSOLE (any staff role) — every /admin/* URL stays in AdminLayout */}
      <Route element={<ProtectedRoute anyRole={STAFF_ROLES} />}>
        <Route path={ROUTES.ADMIN.CHANGE_PASSWORD} element={<AdminChangePasswordPage />} />

        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN.SETTINGS} element={<AdminSecurityPage />} />
          {renderPlanned(ADMIN_STAFF_PLANNED, ROUTES.ADMIN.DASHBOARD, 'Back to Dashboard')}

          <Route element={<ProtectedRoute role={USER_ROLES.ADMIN} />}>
            <Route path={ROUTES.ADMIN.AUDIT_LOGS} element={<AdminAuditLogsPage />} />
            {renderPlanned(ADMIN_MANAGER_PLANNED, ROUTES.ADMIN.DASHBOARD, 'Back to Dashboard')}
          </Route>

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
