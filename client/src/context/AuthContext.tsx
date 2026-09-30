import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, RegisterPayload, LoginPayload } from '../services/auth.service';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True only while the initial session check runs on app load */
  isLoading: boolean;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize authentication status on application load
  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Login/register don't touch isLoading: toggling it would make AppRoutes swap
  // the page for a loader, unmounting the form and losing its error state.
  // Forms track their own submitting state instead.
  const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    const result = await authService.register(payload);
    setUser(result.user);
    return result.user;
  };

  const login = async (payload: LoginPayload): Promise<AuthUser> => {
    const result = await authService.login(payload);
    setUser(result.user);
    return result.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        register,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
