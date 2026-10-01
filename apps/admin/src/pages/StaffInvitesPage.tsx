import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { ROLE_LABELS } from '@shared/constants/roles';
import { formatDateTime } from '@shared/utils/format';
import Button from '@shared/ui/Button';
import ApiLoader from '@shared/ui/Spinner';
import { toast } from '@shared/ui/Toast';
import { staffService, type StaffInvitationItem } from '../services/staff.service';
import InviteStaffModal from '../components/staff/InviteStaffModal';

const STATUS_CONFIG: Record<
  StaffInvitationItem['status'],
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    icon: <Clock className="w-3 h-3" />,
  },
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  EXPIRED: {
    label: 'Expired',
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-700',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  REVOKED: {
    label: 'Revoked',
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-600',
    icon: <XCircle className="w-3 h-3" />,
  },
};

export const StaffInvitesPage: React.FC = () => {
  const [invitations, setInvitations] = useState<StaffInvitationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await staffService.listInvitations();
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load invitations';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleResend = async (id: string, email: string) => {
    try {
      setActionLoadingId(id);
      await staffService.resendInvitation(id);
      toast.success(`Invitation re-sent to ${email}`);
      fetchInvitations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resend invitation');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevoke = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to revoke the invitation for ${email}?`)) {
      return;
    }
    try {
      setActionLoadingId(id);
      await staffService.revokeInvitation(id);
      toast.info(`Invitation for ${email} has been revoked`);
      fetchInvitations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to revoke invitation');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team Invitations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track pending invitations, resend expired links, or provision new administrators.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={fetchInvitations}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="py-2 text-xs"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setInviteModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="py-2 text-xs"
          >
            Invite New User
          </Button>
        </div>
      </div>

      {/* Invitations Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-xs">
        {isLoading && invitations.length === 0 ? (
          <div className="p-8 flex justify-center">
            <ApiLoader text="Loading invitations..." />
          </div>
        ) : error && invitations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Failed to load invitations</p>
            <p className="text-xs text-rose-600 max-w-sm mx-auto">{error}</p>
            <Button
              variant="primary"
              onClick={fetchInvitations}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="py-1.5 text-xs mx-auto"
            >
              Retry Loading Invitations
            </Button>
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No invitations found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't issued any pending administrator invitations yet.
            </p>
            <Button
              variant="primary"
              onClick={() => setInviteModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="py-2 text-xs"
            >
              Invite First Administrator
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Invited Member</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Permissions</th>
                  <th className="py-3 px-4">Invited By</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invitations.map((inv) => {
                  const statusInfo = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
                  const isActionLoading = actionLoadingId === inv.id;
                  const permsCount = inv.customPermissions?.length || 0;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{inv.email}</p>
                            {inv.name && (
                              <p className="text-[11px] text-slate-400 truncate">{inv.name}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Target Role */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700">
                          {ROLE_LABELS[inv.role] || inv.role}
                        </span>
                      </td>

                      {/* Permissions */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {permsCount > 0 ? (
                          <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                            {permsCount} Custom
                          </span>
                        ) : (
                          'Role Default'
                        )}
                      </td>

                      {/* Invited By */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {inv.invitedByName || 'Administrator'}
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDateTime(inv.expiresAt)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => handleResend(inv.id, inv.email)}
                                disabled={isActionLoading}
                                leftIcon={<Send className="w-3 h-3" />}
                                className="py-1 px-2.5 text-[11px]"
                              >
                                Resend
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleRevoke(inv.id, inv.email)}
                                disabled={isActionLoading}
                                className="py-1 px-2.5 text-[11px] text-rose-600 hover:bg-rose-50"
                              >
                                Revoke
                              </Button>
                            </>
                          )}
                          {inv.status === 'EXPIRED' && (
                            <Button
                              variant="outline"
                              onClick={() => handleResend(inv.id, inv.email)}
                              disabled={isActionLoading}
                              leftIcon={<RefreshCw className="w-3 h-3" />}
                              className="py-1 px-2.5 text-[11px]"
                            >
                              Renew Link
                            </Button>
                          )}
                          {inv.status === 'ACCEPTED' && (
                            <span className="text-[11px] text-emerald-600 font-medium">Joined</span>
                          )}
                          {inv.status === 'REVOKED' && (
                            <span className="text-[11px] text-slate-400">Cancelled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteStaffModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvited={() => {
          fetchInvitations();
        }}
      />
    </div>
  );
};

export default StaffInvitesPage;
