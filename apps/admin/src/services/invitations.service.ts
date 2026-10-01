import { api, unwrap } from '@shared/api/client';

export type InvitationStatus = 'INVITED' | 'REGISTERED' | 'EXPIRED' | 'REVOKED';

export interface StaffInvitationItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userCode: string;
  designation?: string;
  roleId: string;
  roleName: string;
  roleKey: string;
  message?: string;
  status: InvitationStatus;
  expiresAt: string;
  sentCount: number;
  lastSentAt?: string;
  invitedBy?: string;
  invitedByName?: string;
  registeredAt?: string;
  userId?: string;
  createdAt: string;
}

export interface InvitationsResponse {
  items: StaffInvitationItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InvitationQuery {
  page?: number;
  limit?: number;
  status?: string;
  roleId?: string;
  q?: string;
}

export interface CreateInvitationPayload {
  firstName: string;
  lastName: string;
  email: string;
  userCode: string;
  designation?: string;
  roleIds: string[];
  message?: string;
}

export interface VerifiedInvitationData {
  firstName: string;
  lastName: string;
  email: string;
  fullEmail: string;
  roleName: string;
  designation?: string;
  expiresAt: string;
}

export const invitationsService = {
  listInvitations: (query: InvitationQuery = {}) => {
    const params = Object.fromEntries(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== ''),
    );
    return unwrap<InvitationsResponse>(api.get('/admin/invitations', { params }));
  },

  createInvitation: (payload: CreateInvitationPayload) => {
    return unwrap<{ id: string; email: string; roleName: string; expiresAt: string }>(
      api.post('/admin/invitations', payload),
    );
  },

  resendInvitation: (id: string) => {
    return unwrap<{ id: string; email: string; roleName: string; expiresAt: string }>(
      api.post(`/admin/invitations/${id}/resend`),
    );
  },

  revokeInvitation: (id: string) => {
    return unwrap<{ id: string; email: string; status: InvitationStatus }>(
      api.post(`/admin/invitations/${id}/revoke`),
    );
  },

  verifyInvitationToken: (token: string) => {
    return unwrap<VerifiedInvitationData>(api.post('/invitations/verify', { token }));
  },

  acceptInvitation: (payload: { token: string; password: string }) => {
    return unwrap<{ user: { id: string; email: string; userCode: string; role: string } }>(
      api.post('/invitations/accept', payload),
    );
  },
};
