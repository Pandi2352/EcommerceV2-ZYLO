import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import ProtectedRoute from '@shared/auth/ProtectedRoute';
import PublicOnlyRoute from '@shared/auth/PublicOnlyRoute';
import MfaVerifyPage from '@shared/auth/pages/MfaVerifyPage';
import ForgotPasswordPage from '@shared/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@shared/auth/pages/ResetPasswordPage';
import NotFoundPage from '@shared/pages/NotFoundPage';
import ComingSoonPage from '@shared/pages/ComingSoonPage';
import PageLoader from '@shared/ui/PageLoader';
import { ROUTES } from './routePaths';
import { CUSTOMER_ACCOUNT_PLANNED, CUSTOMER_PUBLIC_PLANNED, type PlannedRoute } from './plannedRoutes';

import CustomerLayout from '../components/layout/CustomerLayout';
import CustomerHomePage from '../pages/customer/HomePage';
import ShopPage from '../pages/customer/ShopPage';
import ProductDetailsPage from '../pages/customer/ProductDetailsPage';
import CustomerRegisterPage from '../pages/customer/RegisterPage';
import CustomerLoginPage from '../pages/customer/LoginPage';
import AccountSecurityPage from '../pages/account/AccountSecurityPage';
import CustomerProfilePage from '../pages/account/CustomerProfilePage';
import CustomerAddressesPage from '../pages/account/CustomerAddressesPage';
import CartPage from '../pages/customer/CartPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';

const renderPlanned = (routes: PlannedRoute[]) =>
  routes.map(({ path, title }) => (
    <Route
      key={path}
      path={path}
      element={<ComingSoonPage title={title} backTo={ROUTES.CUSTOMER.HOME} backLabel="Back to Home" />}
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
      {/* 1. HOME — keeps the category rail */}
      <Route element={<CustomerLayout />}>
        <Route path={ROUTES.CUSTOMER.HOME} element={<CustomerHomePage />} />
      </Route>

      {/* 2. INNER PAGES (no category rail) + 404 */}
      <Route element={<CustomerLayout showRail={false} />}>
        <Route path={ROUTES.CUSTOMER.SHOP} element={<ShopPage />} />
        <Route path={ROUTES.CUSTOMER.CART} element={<CartPage />} />
        <Route path={ROUTES.CUSTOMER.PRODUCT_DETAILS} element={<ProductDetailsPage />} />
        <Route path="/product/:slug" element={<ProductDetailsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        {renderPlanned(CUSTOMER_PUBLIC_PLANNED)}

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.CUSTOMER.PROFILE} element={<CustomerProfilePage />} />
          <Route path={ROUTES.CUSTOMER.ADDRESSES} element={<CustomerAddressesPage />} />
          <Route path={ROUTES.CUSTOMER.SECURITY} element={<AccountSecurityPage />} />
          {renderPlanned(CUSTOMER_ACCOUNT_PLANNED)}
        </Route>

        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Route>

      {/* 3. SIGN-IN PAGES (signed-in customers are sent home) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.CUSTOMER.REGISTER} element={<CustomerRegisterPage />} />
        <Route path={ROUTES.CUSTOMER.LOGIN} element={<CustomerLoginPage />} />
        <Route path={ROUTES.CUSTOMER.LOGIN_VERIFY} element={<MfaVerifyPage />} />
      </Route>

      {/* 4. EMAILED LINKS (work whether or not the user is signed in) */}
      <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<ResetPasswordPage />} />
      <Route path={ROUTES.AUTH.VERIFY_EMAIL} element={<VerifyEmailPage />} />
    </Routes>
  );
};

export default AppRoutes;
