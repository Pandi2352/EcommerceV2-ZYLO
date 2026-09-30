import { ROUTES } from './routePaths';

export interface PlannedRoute {
  path: string;
  title: string;
}

// Sections that are linked from the sidebar but not built yet. They render a
// "coming soon" placeholder; move an entry to a real <Route> once built.

/** Open to every staff role */
export const STAFF_PLANNED: PlannedRoute[] = [
  { path: ROUTES.ORDERS, title: 'Orders' },
  { path: ROUTES.CUSTOMERS, title: 'Customers' },
];

/** Requires ADMIN or above */
export const MANAGER_PLANNED: PlannedRoute[] = [
  { path: ROUTES.PRODUCTS, title: 'Products' },
  { path: ROUTES.CATEGORIES, title: 'Categories' },
  { path: ROUTES.ANALYTICS, title: 'Analytics' },
];
