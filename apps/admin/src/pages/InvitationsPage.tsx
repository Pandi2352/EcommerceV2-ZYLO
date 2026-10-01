import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Mail,
  RefreshCw,
  Plus,
  RotateCw,
  ExternalLink,
  Shield,
  Search,
  XCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  FcInvite,
  FcClock,
  FcCheckmark,
  FcCancel,
} from 'react-icons/fc';
import { formatDateTime } from '@shared/utils/format';
import Button from '@shared/ui/Button';
import ApiLoader from '@shared/ui/Spinner';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { useAuth } from '@shared/auth/AuthContext';
import {
  invitationsService,
  type StaffInvitationItem,
} from '../services/invitations.service';
import { extractErrorMessage } from '@shared/api/client';
import InviteUserDrawer from '../components/users/InviteUserDrawer';

export const InvitationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = useAuth();

  const queryStatus = searchParams.get('status') || '';
  const queryQ = searchParams.get('q') || '';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);

  const [invitations, setInvitations] = useState<StaffInvitationItem[]>([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    registeredCount: 0,
    expiredOrRevokedCount: 0,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Action confirmations
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [resendInviteItem, setResendInviteItem] = useState<StaffInvitationItem | null>(null);
  const [revokeInviteItem, setRevokeInviteItem] = useState<StaffInvitationItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchInvitations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: any = await invitationsService.listInvitations({
        page: queryPage,
        limit: 15,
        status: queryStatus || undefined,
        q: queryQ.trim() || undefined,
      });

      const list = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setInvitations(list);
      setTotal(res?.meta?.total ?? res?.total ?? list.length);
      setTotalPages(res?.meta?.totalPages ?? res?.totalPages ?? 1);
      if (res?.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  }, [queryPage, queryStatus, queryQ]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    if (!('page' in updates)) {
      next.set('page', '1');
    }
    setSearchParams(next, { replace: true });
  };

  const handleResend = async () => {
    if (!resendInviteItem) return;
    try {
      setIsActionLoading(true);
      await invitationsService.resendInvitation(resendInviteItem.id);
      toast.success(`Fresh invitation link emailed to ${resendInviteItem.email}`);
      setResendInviteItem(null);
      fetchInvitations();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeInviteItem) return;
    try {
      setIsActionLoading(true);
      await invitationsService.revokeInvitation(revokeInviteItem.id);
      toast.success(`Invitation for ${revokeInviteItem.email} revoked.`);
      setRevokeInviteItem(null);
      fetchInvitations();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const statusTabs: { label: string; value: string }[] = [
    { label: 'All Invitations', value: '' },
    { label: 'Pending (Invited)', value: 'INVITED' },
    { label: 'Registered', value: 'REGISTERED' },
    { label: 'Expired', value: 'EXPIRED' },
    { label: 'Revoked', value: 'REVOKED' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Invitations</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {total} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track pending staff onboarding links, rotate invitation tokens, and audit completed registrations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvitations}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          {can('users.invite') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Invite Member
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-indigo-50/70 border border-indigo-100 flex items-center justify-center shrink-0">
            <FcInvite className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Invites
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalCount || total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-amber-50/70 border border-amber-100 flex items-center justify-center shrink-0">
            <FcClock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Acceptance
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.pendingCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-emerald-50/70 border border-emerald-100 flex items-center justify-center shrink-0">
            <FcCheckmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Accepted & Joined
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.registeredCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-rose-50/70 border border-rose-100 flex items-center justify-center shrink-0">
            <FcCancel className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Expired / Revoked
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.expiredOrRevokedCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white p-3.5 rounded-md border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 border-b sm:border-b-0 pb-2 sm:pb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => updateQuery({ status: tab.value || null, page: '1' })}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  queryStatus === tab.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryQ}
              onChange={(e) => updateQuery({ q: e.target.value })}
              placeholder="Search invitees, email, code..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <ApiLoader text="Loading invitations..." />
          </div>
        ) : !invitations || invitations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No invitations found</h3>
            <p className="mt-1 max-w-sm mx-auto">
              No staff invitations match the current status filter or query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                  <th className="px-5 py-3.5">Invitee</th>
                  <th className="px-4 py-3.5">User Code</th>
                  <th className="px-4 py-3.5">Assigned Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Sent Count</th>
                  <th className="px-4 py-3.5">Expires</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(invitations || []).map((inv) => {
                  const isPending = inv.status === 'INVITED';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {inv.firstName} {inv.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{inv.email}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {inv.userCode}
                        </span>
                        {inv.designation && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{inv.designation}</div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Shield className="w-3 h-3" />
                          {inv.roleName}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {inv.status === 'INVITED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Pending
                          </span>
                        )}
                        {inv.status === 'REGISTERED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            Registered
                          </span>
                        )}
                        {inv.status === 'EXPIRED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            Expired
                          </span>
                        )}
                        {inv.status === 'REVOKED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            Revoked
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {inv.sentCount} time(s)
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        {formatDateTime(inv.expiresAt)}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && can('users.invite') && (
                            <>
                              <button
                                type="button"
                                onClick={() => setResendInviteItem(inv)}
                                title="Rotate token and resend invite"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                              >
                                <RotateCw className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRevokeInviteItem(inv)}
                                title="Revoke Invitation"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {inv.status === 'REGISTERED' && inv.userId && (
                            <Link
                              to={`/users/${inv.userId}`}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <span>View Profile</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-semibold text-slate-700">{queryPage}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalPages}</span> ({total} invitations)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={queryPage <= 1}
                onClick={() => updateQuery({ page: String(queryPage - 1) })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={queryPage >= totalPages}
                onClick={() => updateQuery({ page: String(queryPage + 1) })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Member Drawer */}
      <InviteUserDrawer
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={fetchInvitations}
      />

      {/* Resend Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!resendInviteItem}
        onClose={() => setResendInviteItem(null)}
        onConfirm={handleResend}
        isLoading={isActionLoading}
        title="Resend Invitation Link"
        description={
          <span>
            A new secure token will be generated, extending the expiration window for 7 days. Any previously issued invitation link for <strong>{resendInviteItem?.email}</strong> will be immediately invalidated.
          </span>
        }
        tone="primary"
        confirmText="Rotate Token & Resend"
      />

      {/* Revoke Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!revokeInviteItem}
        onClose={() => setRevokeInviteItem(null)}
        onConfirm={handleRevoke}
        isLoading={isActionLoading}
        title="Revoke Staff Invitation"
        description={
          <span>
            Are you sure you want to revoke the invitation for <strong>{revokeInviteItem?.email}</strong>? The recipient will no longer be able to activate an account with this link.
          </span>
        }
        tone="danger"
        confirmText="Revoke Invitation"
      />
    </div>
  );
};

export default InvitationsPage;
