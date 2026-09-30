import { api } from './api';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  isEmailVerified: boolean;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp?: string;
  path?: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<{ user: AuthUser }> {
    const response = await api.post<ApiResponseEnvelope<{ user: AuthUser }>>(
      '/auth/register',
      payload
    );
    return response.data.data;
  },

  async login(payload: LoginPayload): Promise<{ user: AuthUser }> {
    const response = await api.post<ApiResponseEnvelope<{ user: AuthUser }>>(
      '/auth/login',
      payload
    );
    return response.data.data;
  },

  async getProfile(): Promise<AuthUser> {
    const response = await api.get<ApiResponseEnvelope<{ user: AuthUser }>>('/auth/me');
    return response.data.data.user;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
