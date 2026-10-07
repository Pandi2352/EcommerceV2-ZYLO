import { ROUTES } from './routePaths';

export interface PlannedRoute {
  path: string;
  title: string;
}

// Pages that are linked from the UI but not built yet. They render a
// "coming soon" placeholder; move an entry to a real <Route> once built.

export const CUSTOMER_PUBLIC_PLANNED: PlannedRoute[] = [
  { path: ROUTES.CUSTOMER.VENDORS, title: 'Vendors' },
  { path: ROUTES.CUSTOMER.PAGES, title: 'Pages' },
  { path: ROUTES.CUSTOMER.BLOG, title: 'Blog' },
  { path: ROUTES.CUSTOMER.ABOUT, title: 'About Us' },
  { path: ROUTES.CUSTOMER.CAREERS, title: 'Careers' },
  { path: ROUTES.CUSTOMER.TERMS, title: 'Terms & Conditions' },
  { path: ROUTES.CUSTOMER.OPEN_SHOP, title: 'Open a Shop' },
  { path: ROUTES.CUSTOMER.COMPARE, title: 'Compare Products' },
];

export const CUSTOMER_ACCOUNT_PLANNED: PlannedRoute[] = [
  { path: ROUTES.CUSTOMER.DASHBOARD, title: 'My Account' },
];
