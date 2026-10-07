import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Star,
  Package,
} from 'lucide-react';
import type { AdminReviewItem, AdminReviewStats } from '@shared/types/review';
import { reviewsService } from '@shared/api/reviews.service';
import { Button } from '@shared/ui/Button';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { ReviewMetricsCards } from '../components/reviews/ReviewMetricsCards';
import { ReviewDetailsDrawer } from '../components/reviews/ReviewDetailsDrawer';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [stats, setStats] = useState<AdminReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Drawer & Dialog State
  const [selectedReview, setSelectedReview] = useState<AdminReviewItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<AdminReviewItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await reviewsService.getAdminStats();
      setStats(res);
    } catch {
      // ignore
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reviewsService.getAdminReviews({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page,
        limit,
      });

      // Filter in-memory for rating if specified
      let filtered = res.reviews;
      if (ratingFilter !== 'ALL') {
        const starNum = Number(ratingFilter);
        filtered = filtered.filter((r) => r.rating === starNum);
      }

      setReviews(filtered);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, ratingFilter, page, limit]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleQuickStatus = async (review: AdminReviewItem, status: 'APPROVED' | 'REJECTED') => {
    try {
      setUpdatingId(review._id);
      await reviewsService.updateAdminStatus(review._id, status);
      toast.success(`Review marked as ${status}`);
      fetchReviews();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update review');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    try {
      setIsDeleting(true);
      await reviewsService.deleteAdminReview(reviewToDelete._id);
      toast.success('Review deleted successfully');
      setReviewToDelete(null);
      fetchReviews();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Customer Reviews & Ratings Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit customer feedbacks, moderate submitted reviews, and verify purchaser claims.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              fetchReviews();
              fetchStats();
            }}
            disabled={loading}
            className="text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <ReviewMetricsCards stats={stats} loading={statsLoading} />

      {/* Filters & Control Panel */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'ALL', label: 'All Reviews', count: stats?.totalReviews },
            { id: 'PENDING', label: 'Pending Moderation', count: stats?.pendingReviews, highlight: (stats?.pendingReviews || 0) > 0 },
            { id: 'APPROVED', label: 'Approved & Public', count: stats?.approvedReviews },
            { id: 'REJECTED', label: 'Rejected', count: stats?.rejectedReviews },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    tab.highlight
                      ? 'bg-amber-100 text-amber-800 font-bold'
                      : statusFilter === tab.id
                      ? 'bg-indigo-200/60 text-indigo-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Star Filter */}
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
              placeholder="Search reviewer, title, product..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Stars:</span>
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-700"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars only</option>
              <option value="1">1 Star only</option>
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

      {/* Reviews Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Feedback & Comment</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                      <span>Loading customer reviews...</span>
                    </div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">No reviews found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting search terms or status filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  const product = typeof r.productId === 'object' ? r.productId : null;
                  const thumb =
                    product?.thumbnailUrl ||
                    product?.images?.find((img) => img.isPrimary)?.url ||
                    product?.images?.[0]?.url ||
                    '';

                  return (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Snippet */}
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                        <div className="flex items-center gap-2.5">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={product?.name || 'Product'}
                              className="w-10 h-10 object-cover rounded-md border border-slate-200 bg-white shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {product?.name || 'Product item'}
                            </p>
                            {product?.sku && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                            {r.customerName ? r.customerName.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <span className="font-medium text-slate-800">{r.customerName}</span>
                        </div>
                        {r.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= r.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-100 text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-[11px] font-bold text-slate-700">
                            {r.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Feedback & Comment Excerpt */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-semibold text-slate-800 truncate">{r.title}</p>
                        <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                          {r.comment}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {r.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {r.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                        {r.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Moderation Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(r, 'APPROVED')}
                              disabled={updatingId === r._id}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Approve Review"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          )}

                          {r.status !== 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(r, 'REJECTED')}
                              disabled={updatingId === r._id}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              title="Reject Review"
                            >
                              <XCircle className="w-3.5 h-3.5 text-amber-600" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReview(r);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setReviewToDelete(r)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Review"
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
              of <strong className="text-slate-700">{totalCount}</strong> reviews
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

      {/* Review Details Drawer */}
      <ReviewDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
        onStatusUpdated={() => {
          fetchReviews();
          fetchStats();
        }}
        onDeleteRequested={(rev) => {
          setIsDrawerOpen(false);
          setReviewToDelete(rev);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete customer review?"
        description="Are you sure you want to permanently remove this review? The product average rating will automatically be recalculated."
        confirmText="Delete Review"
        tone="danger"
      />
    </div>
  );
};
export default ReviewsPage;
