import { ROUTES } from './routePaths';
import type { AuthPortal } from '../types/auth';
import type { UserRole } from '../constants/roles';
import { isStaffRole } from '../constants/roles';

export interface PortalRoutes {
  login: string;
  loginVerify: string;
  home: string;
  /** Where a user flagged `mustChangePassword` is sent */
  changePassword: string;
  security: string;
}

/** URLs that differ per portal, so shared auth components work in both. */
export const PORTAL_ROUTES: Record<AuthPortal, PortalRoutes> = {
  customer: {
    login: ROUTES.CUSTOMER.LOGIN,
    loginVerify: ROUTES.CUSTOMER.LOGIN_VERIFY,
    home: ROUTES.CUSTOMER.HOME,
    changePassword: ROUTES.CUSTOMER.SECURITY,
    security: ROUTES.CUSTOMER.SECURITY,
  },
  admin: {
    login: ROUTES.ADMIN.LOGIN,
    loginVerify: ROUTES.ADMIN.LOGIN_VERIFY,
    home: ROUTES.ADMIN.DASHBOARD,
    changePassword: ROUTES.ADMIN.CHANGE_PASSWORD,
    security: ROUTES.ADMIN.SETTINGS,
  },
};

export function portalForRole(role: UserRole): AuthPortal {
  return isStaffRole(role) ? 'admin' : 'customer';
}

/** Read `?portal=admin` from email links; anything else means customer. */
export function portalFromParam(value: string | null): AuthPortal {
  return value === 'admin' ? 'admin' : 'customer';
}
