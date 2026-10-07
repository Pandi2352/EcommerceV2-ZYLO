import React, { useEffect, useState } from 'react';
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Package,
  RefreshCw,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react';
import type { AdminReturnSummary, ReturnRequest } from '@shared/types/return';
import {
  RETURN_REASON_LABELS,
  RETURN_STATUS_CONFIG,
  ReturnStatus,
} from '@shared/types/return';
import { returnsService } from '@shared/api/returns.service';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { formatPrice } from '@shared/utils/currency';
import { ReturnDetailsDrawer } from '../components/returns/ReturnDetailsDrawer';

type StatusFilter = 'ALL' | ReturnStatus;

export const ReturnsPage: React.FC = () => {
  const [summary, setSummary] = useState<AdminReturnSummary>({
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    refundedCount: 0,
    rejectedCount: 0,
    totalRefundedAmount: 0,
  });

  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_desc' | 'amount_asc'>('newest');

  // Selected for Drawer
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      const data = await returnsService.getAdminSummary();
      setSummary(data);
    } catch {
      // quiet fail
    }
  };

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await returnsService.getAdminReturns({
        page,
        limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined,
        sortBy,
      });
      setReturns(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load return requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [page, statusFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReturns();
  };

  const handleOpenDrawer = (ret: ReturnRequest) => {
    setSelectedReturn(ret);
    setIsDrawerOpen(true);
  };

  const handleReturnUpdated = (updated: ReturnRequest) => {
    setReturns((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    if (selectedReturn && selectedReturn._id === updated._id) {
      setSelectedReturn(updated);
    }
    fetchSummary();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <RotateCcw className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Returns & Refunds Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review customer return requests, execute automated stock replenishment, and trigger payment gateway refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchSummary();
              fetchReturns();
              toast.success('Returns queue refreshed');
            }}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Requests</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {summary.totalRequests}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Lifetime returns</span>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2 font-mono">
            {summary.pendingCount}
          </p>
          <span className="text-[11px] text-amber-600/90 mt-0.5 block">Requires staff decision</span>
        </div>

        <div className="bg-white border border-blue-200 bg-blue-50/20 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 text-xs font-semibold">
            <span>Approved</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2 font-mono">
            {summary.approvedCount}
          </p>
          <span className="text-[11px] text-blue-600/90 mt-0.5 block">Awaiting / ready for refund</span>
        </div>

        <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Refunded</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {formatPrice(summary.totalRefundedAmount)}
          </p>
          <span className="text-[11px] text-emerald-600/90 mt-0.5 block">
            {summary.refundedCount} completed refunds
          </span>
        </div>

        <div className="bg-white border border-rose-200 bg-rose-50/20 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2 font-mono">
            {summary.rejectedCount}
          </p>
          <span className="text-[11px] text-rose-600/90 mt-0.5 block">Declined claims</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-xs">
        {/* Status Tabs */}
        <div className="flex border-b border-slate-100 gap-6 text-xs font-semibold overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: `All Returns (${summary.totalRequests})` },
            { id: ReturnStatus.REQUESTED, label: `Pending (${summary.pendingCount})` },
            { id: ReturnStatus.APPROVED, label: `Approved (${summary.approvedCount})` },
            { id: ReturnStatus.REFUNDED, label: `Refunded (${summary.refundedCount})` },
            { id: ReturnStatus.REJECTED, label: `Rejected (${summary.rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id as StatusFilter);
                setPage(1);
              }}
              className={`pb-3 relative transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'text-amber-600 font-bold border-b-2 border-amber-500'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Sort Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search return #, order #, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs py-2 pl-8 pr-3 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="text-xs py-1.5 px-2.5 border border-slate-200 rounded-md bg-white font-medium focus:border-amber-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Highest Refund</option>
              <option value="amount_asc">Lowest Refund</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs font-medium">Loading return requests...</span>
          </div>
        ) : returns.length === 0 ? (
          <div className="py-20 text-center p-6">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No return requests found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? `No requests match "${search}". Try searching by order number or customer name.`
                : 'There are no return requests matching this status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Return Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Refund Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {returns.map((ret) => {
                  const statusCfg = RETURN_STATUS_CONFIG[ret.status] || {
                    label: ret.status,
                    color: '#64748b',
                    bg: '#f1f5f9',
                    border: '#e2e8f0',
                  };

                  return (
                    <tr
                      key={ret._id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => handleOpenDrawer(ret)}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {ret.returnNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{ret.customerName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {ret.customerEmail}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-amber-600">
                          #{ret.orderNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                          {RETURN_REASON_LABELS[ret.reason] || ret.reason}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {ret.items.reduce((s, i) => s + i.quantity, 0)} unit(s)
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                        {formatPrice(ret.totalRefundAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap"
                          style={{
                            backgroundColor: statusCfg.bg,
                            color: statusCfg.color,
                            borderColor: statusCfg.border,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDrawer(ret)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} requests
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Return Details & Actions Drawer */}
      <ReturnDetailsDrawer
        returnReq={selectedReturn}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onReturnUpdated={handleReturnUpdated}
      />
    </div>
  );
};

export default ReturnsPage;
