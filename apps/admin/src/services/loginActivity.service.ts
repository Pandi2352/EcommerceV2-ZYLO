import { api, unwrap } from '@shared/api/client';

export type LoginActivityStatus = 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'LOGOUT';

export interface LoginActivityItem {
  id: string;
  userId?: string;
  userName: string;
  email: string;
  userCode?: string;
  designation?: string;
  role: string;
  event: string;
  status: LoginActivityStatus;
  statusLabel: string;
  failureReason?: string;
  ip: string;
  browser: string;
  os: string;
  device: string;
  userAgent?: string;
  createdAt: string;
}

export interface LoginActivityStats {
  totalAttempts: number;
  successCount: number;
  failedCount: number;
  uniqueStaffCount: number;
}

export interface LoginActivityResponse {
  items: LoginActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: LoginActivityStats;
}

export interface LoginActivityQuery {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  q?: string;
  range?: 'today' | '7d' | '30d' | 'all';
}

export const loginActivityService = {
  getLoginActivity: (query: LoginActivityQuery = {}) => {
    const params = Object.fromEntries(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== ''),
    );
    return unwrap<LoginActivityResponse>(api.get('/admin/login-activity', { params }));
  },

  revokeUserSessions: (userId: string) => {
    return unwrap<{ success: boolean; message: string }>(
      api.post(`/admin/users/${userId}/revoke-sessions`),
    );
  },
};
