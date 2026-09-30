import { ROUTES } from './routePaths';
import PublicOnlyRoute from './PublicOnlyRoute';
import CustomerHomePage from '../pages/customer/HomePage';
import CustomerRegisterPage from '../pages/customer/RegisterPage';
import CustomerLoginPage from '../pages/customer/LoginPage';
import type { RouteConfig } from './routes.config';

/**
 * Customer Storefront Routes
 * Note: Customer site ONLY includes public registration.
 */
export const customerRoutes: RouteConfig[] = [
  {
    path: ROUTES.CUSTOMER.HOME,
    element: <CustomerHomePage />,
    title: 'ZYLO — Modern E-Commerce Platform',
  },
  {
    path: ROUTES.CUSTOMER.REGISTER,
    element: (
      <PublicOnlyRoute>
        <CustomerRegisterPage />
      </PublicOnlyRoute>
    ),
    title: 'Create Account — ZYLO Customer',
    isPublicOnly: true,
  },
  {
    path: ROUTES.CUSTOMER.LOGIN,
    element: (
      <PublicOnlyRoute>
        <CustomerLoginPage />
      </PublicOnlyRoute>
    ),
    title: 'Sign In — ZYLO Customer',
    isPublicOnly: true,
  },
];
