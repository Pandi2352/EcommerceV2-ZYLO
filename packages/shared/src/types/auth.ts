import type { UserRole } from '../constants/roles';

/** Which sign-in surface a request comes from; each admits different roles. */
export type AuthPortal = 'customer' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  accountType?: 'CUSTOMER' | 'STAFF';
  roleIds?: string[];
  roles?: { id: string; key: string; name: string }[];
  permissions?: string[];
  userCode?: string;
  designation?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  isActive: boolean;
  isEmailVerified: boolean;
  hasPassword: boolean;
  mustChangePassword: boolean;
  mfaEnabled: boolean;
  googleLinked: boolean;
  phone?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

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

/** A login step either finishes (user) or asks for a second factor. */
export type LoginResult = { mfaRequired: false; user: AuthUser } | { mfaRequired: true };

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface MfaSetup {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface BackupCodes {
  backupCodes: string[];
}

export interface AuthProviders {
  google: boolean;
}
