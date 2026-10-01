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
  /** Copyable link; only for pending invitations and callers with users.invite */
  inviteUrl?: string;
}

export interface InvitationsResponse {
  items: StaffInvitationItem[];
  stats?: {
    totalCount: number;
    pendingCount: number;
    registeredCount: number;
    expiredOrRevokedCount: number;
  };
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

/**
 * Returned only when a link is created or re-issued. The server stores just a
 * hash of the token, so the link can never be fetched again afterwards.
 */
export interface InvitationLinkResult {
  id: string;
  email: string;
  /** Auto-generated User ID, e.g. ZY-0004 */
  userCode: string;
  roleName: string;
  expiresAt: string;
  inviteUrl: string;
}

export const invitationsService = {
  listInvitations: (query: InvitationQuery = {}) => {
    const params = Object.fromEntries(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== ''),
    );
    return unwrap<InvitationsResponse>(api.get('/admin/invitations', { params }));
  },

  /** Creates and emails an invitation; the response carries the link once (see InvitationLinkResult). */
  createInvitation: (payload: CreateInvitationPayload) =>
    unwrap<InvitationLinkResult>(api.post('/admin/invitations', payload)),

  /** Issues a new link (the previous one stops working) and emails it again. */
  resendInvitation: (id: string) =>
    unwrap<InvitationLinkResult>(api.post(`/admin/invitations/${id}/resend`)),

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
