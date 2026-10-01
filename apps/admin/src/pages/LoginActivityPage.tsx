import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Laptop,
  Smartphone,
  ExternalLink,
  LogOut,
  Lock,
  Globe,
  Copy,
  Check,
  Activity,
} from 'lucide-react';
import {
  FcMultipleDevices,
  FcSafe,
  FcHighPriority,
  FcBusinessman,
} from 'react-icons/fc';
import { formatDateTime } from '@shared/utils/format';
import Button from '@shared/ui/Button';
import ApiLoader from '@shared/ui/Spinner';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { useAuth } from '@shared/auth/AuthContext';
import {
  loginActivityService,
  type LoginActivityItem,
  type LoginActivityStats,
} from '../services/loginActivity.service';
import { extractErrorMessage } from '@shared/api/client';
import { ROUTES } from '../routes/routePaths';

export const LoginActivityPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser, can } = useAuth();

  const queryStatus = searchParams.get('status') || '';
  const queryQ = searchParams.get('q') || '';
  const queryRange = (searchParams.get('range') as 'today' | '7d' | '30d' | 'all') || 'all';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);

  const [logs, setLogs] = useState<LoginActivityItem[]>([]);
  const [stats, setStats] = useState<LoginActivityStats>({
    totalAttempts: 0,
    successCount: 0,
    failedCount: 0,
    uniqueStaffCount: 0,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Session revoke modal
  const [revokeUserItem, setRevokeUserItem] = useState<LoginActivityItem | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: any = await loginActivityService.getLoginActivity({
        page: queryPage,
        limit: 20,
        status: queryStatus || undefined,
        q: queryQ.trim() || undefined,
        range: queryRange,
      });

      const list = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setLogs(list);
      setTotal(res?.meta?.total ?? res?.total ?? list.length);
      setTotalPages(res?.meta?.totalPages ?? res?.totalPages ?? 1);
      if (res?.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [queryPage, queryStatus, queryQ, queryRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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

  const handleRevokeSessions = async () => {
    if (!revokeUserItem?.userId) return;
    try {
      setIsRevoking(true);
      await loginActivityService.revokeUserSessions(revokeUserItem.userId);
      toast.success(`All active sessions revoked for ${revokeUserItem.email}`);
      setRevokeUserItem(null);
      fetchLogs();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    toast.success('IP address copied to clipboard');
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const statusTabs: { label: string; value: string }[] = [
    { label: 'All Events', value: '' },
    { label: 'Successful Sign-ins', value: 'SUCCESS' },
    { label: 'Failed Attempts', value: 'FAILED' },
    { label: 'Blocked / Locked', value: 'BLOCKED' },
    { label: 'Signed Out', value: 'LOGOUT' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Login Activity</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {total} Events
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Audit administrator sign-in attempts, client devices, IP geolocations, and authentication anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Link to={ROUTES.USERS}>
            <Button variant="outline" size="sm" leftIcon={<Globe className="w-4 h-4" />}>
              Staff Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-indigo-50/70 border border-indigo-100 flex items-center justify-center shrink-0">
            <FcMultipleDevices className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Logins (Today)
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalAttempts}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-emerald-50/70 border border-emerald-100 flex items-center justify-center shrink-0">
            <FcSafe className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Successful
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.successCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-rose-50/70 border border-rose-100 flex items-center justify-center shrink-0">
            <FcHighPriority className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Failed / Flagged
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.failedCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-sky-50/70 border border-sky-100 flex items-center justify-center shrink-0">
            <FcBusinessman className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Staff (Today)
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.uniqueStaffCount}</div>
          </div>
        </div>
      </div>

      {/* Filters & Range Bar */}
      <div className="bg-white p-3.5 rounded-md border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
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

          {/* Time range selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Time:</span>
            <select
              value={queryRange}
              onChange={(e) => updateQuery({ range: e.target.value as any, page: '1' })}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Search row */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={queryQ}
            onChange={(e) => updateQuery({ q: e.target.value })}
            placeholder="Search activity by staff name, email, IP address, or browser..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <ApiLoader text="Loading login activity records..." />
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No login activity records</h3>
            <p className="mt-1 max-w-sm mx-auto">
              No authentication events match the current filter or date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                  <th className="px-5 py-3.5">Staff Administrator</th>
                  <th className="px-4 py-3.5">Status & Event</th>
                  <th className="px-4 py-3.5">Client & Device</th>
                  <th className="px-4 py-3.5">IP Address</th>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(logs || []).map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Staff User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                            {log.userName?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">{log.userName}</span>
                              {log.userCode && (
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                  {log.userCode}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{log.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status & Event */}
                      <td className="px-4 py-3.5">
                        {log.status === 'SUCCESS' && (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Success
                            </span>
                          </div>
                        )}

                        {log.status === 'FAILED' && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-500" />
                              Failed
                            </span>
                            {log.failureReason && (
                              <div className="text-[11px] text-rose-600 font-medium mt-1">
                                {log.failureReason}
                              </div>
                            )}
                          </div>
                        )}

                        {log.status === 'BLOCKED' && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Lock className="w-3 h-3 text-amber-500" />
                              Blocked
                            </span>
                            <div className="text-[11px] text-amber-600 font-medium mt-1">
                              Account Locked
                            </div>
                          </div>
                        )}

                        {log.status === 'LOGOUT' && (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <LogOut className="w-3 h-3 text-slate-400" />
                              {log.statusLabel}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Client & Device */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {log.device === 'Mobile' ? (
                            <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div>
                            <div className="text-xs font-semibold text-slate-800">
                              {log.browser}
                            </div>
                            <div className="text-[11px] text-slate-400">{log.os}</div>
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {log.ip}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyIp(log.ip)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                            title="Copy IP"
                          >
                            {copiedIp === log.ip ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        {formatDateTime(log.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          {log.userId && (
                            <Link
                              to={`/users/${log.userId}`}
                              title="View Staff Profile"
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <span>Profile</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}

                          {can('users.edit') && log.userId && log.userId !== currentUser?.id && (
                            <button
                              type="button"
                              onClick={() => setRevokeUserItem(log)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-1.5 py-0.5 rounded-md hover:bg-rose-50"
                              title="Revoke all active sessions for this user"
                            >
                              Revoke Sessions
                            </button>
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
              <span className="font-semibold text-slate-700">{totalPages}</span> ({total} records)
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

      {/* Revoke Sessions Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!revokeUserItem}
        onClose={() => setRevokeUserItem(null)}
        onConfirm={handleRevokeSessions}
        isLoading={isRevoking}
        title="Revoke Active Sessions"
        description={
          <span>
            Are you sure you want to terminate all active sessions for{' '}
            <strong>{revokeUserItem?.userName}</strong> ({revokeUserItem?.email})? All current refresh tokens will be immediately invalidated and they will be forced to sign in again.
          </span>
        }
        tone="warning"
        confirmText="Revoke All Sessions"
      />
    </div>
  );
};

export default LoginActivityPage;
