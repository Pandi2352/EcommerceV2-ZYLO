import { api, unwrap } from '@shared/api/client';
import type { UserRole } from '@shared/constants/roles';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mfaEnabled?: boolean;
  customPermissions?: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffInvitationItem {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  customPermissions: string[];
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  invitedBy: string;
  invitedByName?: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface StaffListQuery {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface StaffStats {
  totalStaff: number;
  activeCount: number;
  suspendedCount: number;
  mfaEnabledCount: number;
  rolesDistribution: Record<string, number>;
}

export interface StaffListResponse {
  items: StaffUser[];
  total: number;
  stats: StaffStats;
}

export interface InviteStaffPayload {
  email: string;
  name?: string;
  role: UserRole;
  customPermissions?: string[];
}

export interface InviteStaffResponse {
  invitation: StaffInvitationItem;
  inviteLink: string;
}

export interface ValidateInviteResponse {
  email: string;
  role: UserRole;
  name?: string;
  customPermissions: string[];
  invitedByName?: string;
}

export const staffService = {
  listStaff: (query: StaffListQuery = {}) => {
    const params = Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== '' && value !== undefined),
    );
    return unwrap<StaffListResponse>(api.get('/admin/staff/users', { params }));
  },

  updateRole: (userId: string, role: UserRole) => {
    return unwrap<StaffUser>(api.patch(`/admin/staff/users/${userId}/role`, { role }));
  },

  updatePermissions: (userId: string, permissions: string[]) => {
    return unwrap<StaffUser>(
      api.patch(`/admin/staff/users/${userId}/permissions`, { permissions }),
    );
  },

  updateStatus: (userId: string, isActive: boolean) => {
    return unwrap<StaffUser>(api.patch(`/admin/staff/users/${userId}/status`, { isActive }));
  },

  inviteStaff: (payload: InviteStaffPayload) => {
    return unwrap<InviteStaffResponse>(api.post('/admin/staff/invitations', payload));
  },

  listInvitations: () => {
    return unwrap<StaffInvitationItem[]>(api.get('/admin/staff/invitations'));
  },

  resendInvitation: (id: string) => {
    return unwrap<InviteStaffResponse>(api.post(`/admin/staff/invitations/${id}/resend`));
  },

  revokeInvitation: (id: string) => {
    return unwrap<StaffInvitationItem>(api.delete(`/admin/staff/invitations/${id}`));
  },

  validateToken: (token: string) => {
    return unwrap<ValidateInviteResponse>(api.get(`/admin/staff/invite/${token}`));
  },

  acceptInvitation: (payload: { token: string; name: string; password: string }) => {
    return unwrap<StaffUser>(api.post('/admin/staff/accept-invite', payload));
  },
};
