import { ROUTES } from './routePaths';

export interface PlannedRoute {
  path: string;
  title: string;
}

// Sections that are linked from the sidebar but not built yet. They render a
// "coming soon" placeholder; move an entry to a real <Route> once built.

/** Open to every staff role */
export const STAFF_PLANNED: PlannedRoute[] = [
  { path: ROUTES.ORDERS, title: 'Orders Management' },
  { path: ROUTES.SHIPMENTS, title: 'Shipments & Fulfillment' },
  { path: ROUTES.RETURNS, title: 'Returns & Refunds' },
  { path: ROUTES.INVOICES, title: 'Invoices & Receipts' },
  { path: ROUTES.CUSTOMERS, title: 'Customer Directory' },
  { path: ROUTES.REVIEWS, title: 'Product Reviews & Ratings' },
  { path: ROUTES.COUPONS, title: 'Coupons & Vouchers' },
  { path: ROUTES.PROMOTIONS, title: 'Promotions & Flash Deals' },
  { path: ROUTES.DASHBOARDS_ANALYTICS, title: 'Sales Analytics & Reports' },
];

/** Requires ADMIN or above */
export const MANAGER_PLANNED: PlannedRoute[] = [
  { path: ROUTES.INVENTORY, title: 'Inventory & Stock Control' },
  { path: ROUTES.SETTINGS, title: 'General Store Settings' },
  { path: ROUTES.SETTINGS_PAYMENTS, title: 'Payment Gateways Setup' },
  { path: ROUTES.SETTINGS_SHIPPING, title: 'Shipping Methods & Rates' },
];
