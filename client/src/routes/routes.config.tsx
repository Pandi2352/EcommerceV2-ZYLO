import React from 'react';
import { ROUTES } from './routePaths';
import { customerRoutes } from './customer.routes';
import { adminRoutes } from './admin.routes';
import NotFoundPage from '../pages/common/NotFoundPage';

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  title?: string;
  isPublicOnly?: boolean;
  isProtected?: boolean;
  allowedRoles?: string[];
}

/**
 * Common System Fallback Routes
 */
export const commonRoutes: RouteConfig[] = [
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
    title: 'Page Not Found — ZYLO',
  },
];

/**
 * Unified Routes Configuration
 * Combines Customer storefront routes + Admin portal routes + Fallback routes
 */
export const routesConfig: RouteConfig[] = [
  ...customerRoutes,
  ...adminRoutes,
  ...commonRoutes,
];

export default routesConfig;
