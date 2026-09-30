import { ROUTES } from './routePaths';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import type { RouteConfig } from './routes.config';

/**
 * Admin Portal Routes
 * STRICT RULE: No registration page exists for the admin site.
 * Admin accounts are provisioned internally.
 */
export const adminRoutes: RouteConfig[] = [
  {
    path: ROUTES.ADMIN.LOGIN,
    element: (
      <PublicOnlyRoute>
        <AdminLoginPage />
      </PublicOnlyRoute>
    ),
    title: 'Admin Sign In — ZYLO Control Panel',
    isPublicOnly: true,
  },
  {
    path: ROUTES.ADMIN.DASHBOARD,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
    title: 'Admin Dashboard — ZYLO Control Panel',
    isProtected: true,
    allowedRoles: ['ADMIN'],
  },
];
