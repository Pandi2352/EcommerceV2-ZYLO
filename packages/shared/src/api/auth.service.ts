import { api, unwrap, API_BASE_URL } from './client';
import type { MessageResponse } from '../types/api';
import type {
  AuthPortal,
  AuthProviders,
  AuthUser,
  BackupCodes,
  ChangePasswordPayload,
  LoginPayload,
  LoginResult,
  MfaSetup,
  RegisterPayload,
  SendRegistrationOtpResponse,
  VerifyRegistrationOtpPayload,
} from '../types/auth';

const LOGIN_PATHS: Record<AuthPortal, string> = {
  customer: '/auth/login',
  admin: '/auth/admin/login',
};

export const authService = {
  // ─── Session ────────────────────────────────────────────────────────────────
  sendRegistrationOtp: (email: string) =>
    unwrap<SendRegistrationOtpResponse>(api.post('/auth/register/send-otp', { email })),

  verifyRegistrationOtp: (payload: VerifyRegistrationOtpPayload) =>
    unwrap<{ user: AuthUser; message?: string }>(api.post('/auth/register/verify-otp', payload)),

  register: (payload: RegisterPayload) =>
    unwrap<{ user: AuthUser }>(api.post('/auth/register', payload)),

  login: (payload: LoginPayload, portal: AuthPortal) =>
    unwrap<LoginResult>(api.post(LOGIN_PATHS[portal], payload)),

  /** Second factor for a pending sign-in (challenge travels in an HttpOnly cookie) */
  verifyMfa: (code: string) =>
    unwrap<{ user: AuthUser }>(api.post('/auth/mfa/verify', { code })),

  getProfile: async () => (await unwrap<{ user: AuthUser }>(api.get('/auth/me'))).user,

  logout: () => unwrap<MessageResponse>(api.post('/auth/logout')),

  logoutAll: () => unwrap<MessageResponse>(api.post('/auth/logout-all')),

  getProviders: () => unwrap<AuthProviders>(api.get('/auth/providers')),

  /** Full-page navigation target for Google sign-in (not an XHR) */
  googleSignInUrl: (redirect: string, remember: boolean) =>
    `${API_BASE_URL}/auth/google?${new URLSearchParams({ redirect, remember: String(remember) })}`,

  // ─── Password ───────────────────────────────────────────────────────────────
  forgotPassword: (email: string) =>
    unwrap<MessageResponse>(api.post('/auth/password/forgot', { email })),

  resetPassword: (token: string, password: string) =>
    unwrap<MessageResponse>(api.post('/auth/password/reset', { token, password })),

  changePassword: (payload: ChangePasswordPayload) =>
    unwrap<{ user: AuthUser }>(api.post('/auth/password/change', payload)),

  // ─── Email verification ─────────────────────────────────────────────────────
  verifyEmail: (token: string) =>
    unwrap<MessageResponse>(api.post('/auth/email/verify', { token })),

  resendVerification: () =>
    unwrap<MessageResponse>(api.post('/auth/email/resend-verification')),

  // ─── Two-factor authentication ──────────────────────────────────────────────
  startMfaSetup: () => unwrap<MfaSetup>(api.post('/auth/mfa/setup')),

  enableMfa: (code: string) => unwrap<BackupCodes>(api.post('/auth/mfa/enable', { code })),

  disableMfa: (code: string, password?: string) =>
    unwrap<MessageResponse>(api.post('/auth/mfa/disable', { code, password })),

  regenerateBackupCodes: (code: string) =>
    unwrap<BackupCodes>(api.post('/auth/mfa/backup-codes', { code })),
};
