import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  AuthUser,
  LoginPayload,
  LoginResult,
  RegisterPayload,
  VerifyRegistrationOtpPayload,
} from '../types/auth';
import { usePortal } from './PortalContext';
import { authService } from '../api/auth.service';
import { onSessionExpired } from '../api/client';

import type { PermissionKey } from '../constants/permissionKeys';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True only while the initial session check runs on app load */
  isLoading: boolean;
  can: (permission: PermissionKey | string) => boolean;
  canAny: (...permissions: (PermissionKey | string)[]) => boolean;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  registerWithOtp: (payload: VerifyRegistrationOtpPayload) => Promise<AuthUser>;
  /** First factor. Resolves with `mfaRequired: true` when a second factor is needed. */
  login: (payload: LoginPayload) => Promise<LoginResult>;
  /** Second factor for a pending sign-in */
  verifyMfa: (code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  /** Replace the cached user after an action returns fresh data (e.g. password change) */
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Must be rendered inside a PortalProvider: sign-in is scoped to that portal. */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { portal, roles } = usePortal();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      // A session belonging to the other app (e.g. a customer cookie in the admin
      // app during local development) counts as signed out here.
      setUser(roles.includes(profile.role) ? profile : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [roles]);

  useEffect(() => {
    refreshUser();
    // A failed silent refresh anywhere in the app means the session is over
    return onSessionExpired(() => setUser(null));
  }, [refreshUser]);

  // Login/register don't touch isLoading: toggling it would make AppRoutes swap
  // the page for a loader, unmounting the form and losing its error state.
  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authService.register(payload);
    setUser(result.user);
    return result.user;
  }, []);

  const registerWithOtp = useCallback(async (payload: VerifyRegistrationOtpPayload) => {
    const result = await authService.verifyRegistrationOtp(payload);
    setUser(result.user);
    return result.user;
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authService.login(payload, portal);
    if (!result.mfaRequired && 'user' in result && result.user) {
      setUser(result.user);
    }
    return result;
  }, [portal]);

  const verifyMfa = useCallback(async (code: string) => {
    const result = await authService.verifyMfa(code);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    await authService.logoutAll();
    setUser(null);
  }, []);

  const can = useCallback((permission: PermissionKey | string) => {
    if (!user) return false;
    const perms = user.permissions || [];
    if (perms.includes('*') || user.role === 'SUPER_ADMIN') return true;
    return perms.includes(permission);
  }, [user]);

  const canAny = useCallback((...permissions: (PermissionKey | string)[]) => {
    if (!user) return false;
    const perms = user.permissions || [];
    if (perms.includes('*') || user.role === 'SUPER_ADMIN') return true;
    return permissions.some((p) => perms.includes(p));
  }, [user]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      can,
      canAny,
      register,
      registerWithOtp,
      login,
      verifyMfa,
      logout,
      logoutAll,
      setUser,
      refreshUser,
    }),
    [user, isLoading, can, canAny, register, registerWithOtp, login, verifyMfa, logout, logoutAll, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
