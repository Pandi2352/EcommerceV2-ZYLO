import { api, unwrap } from './api';
import type { Paginated } from '../types/api';
import type { AuthPortal } from '../types/auth';

export interface AuditLogEntry {
  id: string;
  event: string;
  userId?: string;
  email?: string;
  role?: string;
  portal?: AuthPortal;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  event?: string;
  email?: string;
  portal?: AuthPortal;
}

export const AUDIT_EVENTS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'LOGIN_BLOCKED_LOCKED',
  'ACCOUNT_LOCKED',
  'MFA_CHALLENGE_FAILED',
  'MFA_ENABLED',
  'MFA_DISABLED',
  'MFA_BACKUP_CODES_REGENERATED',
  'MFA_BACKUP_CODE_USED',
  'LOGOUT',
  'LOGOUT_ALL',
  'REFRESH_TOKEN_REUSE',
  'PASSWORD_CHANGED',
  'PASSWORD_RESET_REQUESTED',
  'PASSWORD_RESET_COMPLETED',
  'EMAIL_VERIFIED',
  'OAUTH_ACCOUNT_LINKED',
  'OAUTH_ACCOUNT_CREATED',
] as const;

export const auditService = {
  list: (query: AuditLogQuery) => {
    // Drop empty filters so they are not sent as blank query params
    const params = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== '' && value !== undefined));
    return unwrap<Paginated<AuditLogEntry>>(api.get('/audit-logs', { params }));
  },
};
