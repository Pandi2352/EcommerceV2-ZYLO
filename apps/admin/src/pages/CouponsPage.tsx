import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import type { Coupon, CouponDiscountType, CouponStats } from '@shared/types/coupon';
import { couponsService } from '@shared/api/coupons.service';
import { Button } from '@shared/ui/Button';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { CouponMetricsCards } from '../components/coupons/CouponMetricsCards';
import { CouponFormDrawer } from '../components/coupons/CouponFormDrawer';

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Drawer & Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy indicator
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await couponsService.getStats();
      setStats(res);
    } catch {
      // ignore
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await couponsService.list({
        search: search.trim() || undefined,
        status: statusFilter,
        discountType: typeFilter !== 'ALL' ? (typeFilter as CouponDiscountType) : undefined,
        page,
        limit,
      });

      setCoupons(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, page, limit]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await couponsService.toggleStatus(coupon._id, !coupon.isActive);
      toast.success(
        `Coupon "${coupon.code}" is now ${!coupon.isActive ? 'Active' : 'Disabled'}`,
      );
      fetchCoupons();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;
    try {
      setIsDeleting(true);
      await couponsService.delete(couponToDelete._id);
      toast.success(`Coupon "${couponToDelete.code}" deleted successfully`);
      setCouponToDelete(null);
      fetchCoupons();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    } finally {
      setIsDeleting(false);
    }
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.endDate) return false;
    return new Date(coupon.endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600" />
            Promotional Coupons & Vouchers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create discount promo codes, set basket thresholds, and track customer redemptions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              fetchCoupons();
              fetchStats();
            }}
            disabled={loading}
            className="text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setCouponToEdit(null);
              setIsDrawerOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <CouponMetricsCards stats={stats} loading={statsLoading} />

      {/* Filters & Control Panel */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {(['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {s === 'ALL' && 'All Coupons'}
              {s === 'ACTIVE' && 'Active'}
              {s === 'INACTIVE' && 'Paused'}
              {s === 'EXPIRED' && 'Expired'}
            </button>
          ))}
        </div>

        {/* Search and Type Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search code or description..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Type:</span>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-700"
            >
              <option value="ALL">All Types</option>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount ($)</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-700"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount Model</th>
                <th className="py-3 px-4">Thresholds</th>
                <th className="py-3 px-4">Schedule / Validity</th>
                <th className="py-3 px-4">Usage & Redemptions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                      <span>Loading promo coupons...</span>
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Tag className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">No coupons found</p>
                      <p className="text-xs text-slate-400">
                        Try tweaking search terms or create a new coupon campaign.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const expired = isExpired(c);
                  const usagePct = c.usageLimit
                    ? Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100))
                    : null;

                  return (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Coupon Code */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold tracking-wider px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-slate-800">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(c.code)}
                            title="Copy code"
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-slate-400 mt-1 max-w-xs truncate" title={c.description}>
                            {c.description}
                          </p>
                        )}
                      </td>

                      {/* Discount Model */}
                      <td className="py-3.5 px-4">
                        {c.discountType === 'PERCENTAGE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <Percent className="w-3 h-3" />
                            {c.discountValue}% OFF
                          </span>
                        )}
                        {c.discountType === 'FIXED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <DollarSign className="w-3 h-3" />
                            ${c.discountValue} FLAT OFF
                          </span>
                        )}
                        {c.discountType === 'FREE_SHIPPING' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            <Truck className="w-3 h-3" />
                            Free Delivery
                          </span>
                        )}
                      </td>

                      {/* Thresholds */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>
                          {c.minOrderAmount > 0 ? (
                            <span>Min spend: <strong className="text-slate-800">${c.minOrderAmount}</strong></span>
                          ) : (
                            <span className="text-slate-400">No minimum spend</span>
                          )}
                        </div>
                        {c.maxDiscountAmount && c.maxDiscountAmount > 0 && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Capped at ${c.maxDiscountAmount}
                          </p>
                        )}
                      </td>

                      {/* Schedule / Validity */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {c.startDate ? new Date(c.startDate).toLocaleDateString() : 'Immediate'}
                            {' ➔ '}
                            {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'No expiry'}
                          </span>
                        </div>
                        {expired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-1">
                            <AlertTriangle className="w-3 h-3" /> Expired
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            Valid promotion
                          </span>
                        )}
                      </td>

                      {/* Usage & Redemptions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-semibold text-slate-800">{c.usedCount} used</span>
                          <span className="text-slate-400">
                            {c.usageLimit ? `/ ${c.usageLimit} max` : 'Unlimited'}
                          </span>
                        </div>
                        {c.usageLimit && (
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                (usagePct || 0) >= 90 ? 'bg-rose-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {c.perUserLimit} use{c.perUserLimit > 1 ? 's' : ''} per user
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={c.isActive}
                            onChange={() => handleToggleStatus(c)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCouponToEdit(c);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCouponToDelete(c)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-700">{(page - 1) * limit + 1}</strong> to{' '}
              <strong className="text-slate-700">
                {Math.min(page * limit, totalCount)}
              </strong>{' '}
              of <strong className="text-slate-700">{totalCount}</strong> coupons
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <span className="px-2 font-medium text-slate-700">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Drawer */}
      <CouponFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setCouponToEdit(null);
        }}
        couponToEdit={couponToEdit}
        onSaved={() => {
          fetchCoupons();
          fetchStats();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(couponToDelete)}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={`Delete coupon "${couponToDelete?.code}"?`}
        description="Are you sure you want to delete this promotional coupon? This action cannot be undone and customers will no longer be able to apply this code."
        confirmText="Delete Coupon"
        tone="danger"
      />
    </div>
  );
};
export default CouponsPage;
