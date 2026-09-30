import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, RegisterPayload, LoginPayload } from '../services/auth.service';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
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

  const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const result = await authService.register(payload);
      setUser(result.user);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (payload: LoginPayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const result = await authService.login(payload);
      setUser(result.user);
      return result.user;
    } finally {
      setIsLoading(false);
    }
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
