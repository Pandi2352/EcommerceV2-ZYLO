import React, { createContext, useContext } from 'react';
import type { AuthPortal } from '../types/auth';
import type { UserRole } from '../constants/roles';

/** URLs the shared auth UI needs, provided by each app (storefront or admin). */
export interface PortalRoutes {
  home: string;
  login: string;
  loginVerify: string;
  forgotPassword: string;
  resetPassword: string;
  /** Where a user flagged `mustChangePassword` is sent */
  changePassword: string;
  security: string;
}

export interface PortalConfig {
  portal: AuthPortal;
  /** Roles that belong to this app. Sessions of other roles are treated as signed out. */
  roles: readonly UserRole[];
  routes: PortalRoutes;
}

const PortalContext = createContext<PortalConfig | null>(null);

export const PortalProvider: React.FC<{ config: PortalConfig; children: React.ReactNode }> = ({ config, children }) => (
  <PortalContext.Provider value={config}>{children}</PortalContext.Provider>
);

export function usePortal(): PortalConfig {
  const config = useContext(PortalContext);
  if (!config) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return config;
}
