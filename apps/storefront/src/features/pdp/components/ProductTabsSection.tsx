import React, { useState, useEffect, useCallback } from 'react';
import type { ProductItem } from '@shared/types/product';
import type { ProductTabId } from '../hooks/useProductDetails';
import { useAuth } from '@shared/auth/AuthContext';
import { reviewsService } from '@shared/api/reviews.service';
import type {
  ReviewItem,
  ReviewSummary,
} from '@shared/types/review';
import { toast } from '@shared/ui/Toast';
import {
  FileText,
  Sliders,
  Truck,
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  Shield,
  ShieldCheck,
  ThumbsUp,
  PenLine,
  X,
  Filter,
  Trash2,
  ChevronDown,
} from 'lucide-react';

interface ProductTabsSectionProps {
  product: ProductItem;
  activeTab: ProductTabId;
  onTabChange: (tab: ProductTabId) => void;
  onReviewSubmitted?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor - Not recommended',
  2: 'Fair - Below expectations',
  3: 'Average - Meets standard needs',
  4: 'Good - Highly recommended',
  5: 'Excellent - Exceeded all benchmarks',
};

export const ProductTabsSection: React.FC<ProductTabsSectionProps> = ({
  product,
  activeTab,
  onTabChange,
  onReviewSubmitted,
}) => {
  const { user, isAuthenticated } = useAuth();

  // Reviews Data State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // User Review State
  const [myReview, setMyReview] = useState<ReviewItem | null>(null);
  const [userVotedIds, setUserVotedIds] = useState<Set<string>>(new Set());

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch reviews from backend
  const fetchReviews = useCallback(async () => {
    if (!product?._id) return;
    try {
      setIsLoadingReviews(true);
      const res = await reviewsService.getProductReviews(product._id, {
        page: currentPage,
        limit: 10,
        sortBy,
        ratingFilter: ratingFilter || undefined,
      });

      setReviews(res.reviews || []);
      setSummary(res.summary);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);

      // Track if current user voted on any
      const currentUserId = user?.id || (user as any)?._id;
      if (currentUserId) {
        const voted = new Set<string>();
        res.reviews?.forEach((r) => {
          if (r.helpfulUserIds && r.helpfulUserIds.includes(String(currentUserId))) {
            voted.add(r._id);
          }
        });
        setUserVotedIds(voted);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [product?._id, currentPage, sortBy, ratingFilter, user?.id, (user as any)?._id]);

  // Fetch user's existing review
  const fetchMyReview = useCallback(async () => {
    if (!product?._id || !isAuthenticated) return;
    try {
      const res = await reviewsService.getMyReview(product._id);
      if (res?.review) {
        setMyReview(res.review);
      } else {
        setMyReview(null);
      }
    } catch {
      // Ignored if unauthenticated or not found
    }
  }, [product?._id, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
      fetchMyReview();
    }
  }, [activeTab, fetchReviews, fetchMyReview]);

  // Open modal pre-filling existing review if available
  const handleOpenReviewModal = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to write a customer review');
      return;
    }

    if (myReview) {
      setFormRating(myReview.rating);
      setFormTitle(myReview.title);
      setFormComment(myReview.comment);
    } else {
      setFormRating(5);
      setFormTitle('');
      setFormComment('');
    }
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?._id) return;

    if (!formTitle.trim()) {
      setFormError('Please enter a review summary title');
      return;
    }
    if (!formComment.trim()) {
      setFormError('Please provide review details');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      const res = await reviewsService.submitReview(product._id, {
        rating: formRating,
        title: formTitle.trim(),
        comment: formComment.trim(),
      });

      toast.success(res.message || 'Review submitted successfully!');
      setIsModalOpen(false);
      setMyReview(res.review);

      // Refresh reviews list
      fetchReviews();
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit review';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpful Vote Handler
  const handleToggleHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to vote on reviews');
      return;
    }

    try {
      const res = await reviewsService.voteHelpful(reviewId);
      // Update state optimistically
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, helpfulCount: res.helpfulCount } : r,
        ),
      );
      setUserVotedIds((prev) => {
        const next = new Set(prev);
        if (res.hasVoted) {
          next.add(reviewId);
        } else {
          next.delete(reviewId);
        }
        return next;
      });
    } catch (err: any) {
      toast.error('Failed to update helpful vote');
    }
  };

  // Delete Review Handler
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await reviewsService.deleteReview(reviewId);
      toast.success('Your review has been removed');
      setMyReview(null);
      fetchReviews();
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const effectiveCount = summary?.ratingCount ?? product.ratingCount ?? 0;
  const effectiveAverage = summary?.ratingAverage ?? product.ratingAverage ?? 0;

  const tabs = [
    { id: 'overview', label: 'Overview & Highlights', icon: FileText },
    { id: 'specs', label: 'Technical Specifications', icon: Sliders },
    { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
    { id: 'reviews', label: `Reviews (${effectiveCount})`, icon: MessageSquare },
  ] as const;

  return (
    <div id="reviews" className="bg-white border border-slate-200 rounded-md overflow-hidden">
      {/* 1. Tab Navigation Bar */}
      <div className="flex items-center overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-2 pt-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-amber-500 text-amber-900 bg-white rounded-t-md shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 rounded-t-md'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Tab Content Panels */}
      <div className="p-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Product Description
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                {product.description ||
                  product.shortDescription ||
                  'Engineered with premium materials for maximum durability and effortless ergonomics. Each component is thoroughly stress-tested to ensure reliable day-to-day operation in both professional and consumer setups.'}
              </p>
            </div>

            {/* Feature Bullets / Highlights */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Key Features & Capabilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Optimized Build Architecture</span>
                    <span className="text-slate-500">Precision manufacturing using industrial-grade materials for exceptional product longevity.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Certified Energy Efficiency</span>
                    <span className="text-slate-500">Meets global standards for performance with minimized power overhead and thermal dissipation.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Seamless Ecosystem Compatibility</span>
                    <span className="text-slate-500">Instant plug-and-play synchronization with existing accessories, ports, and platforms.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Factory Calibrated Out-of-Box</span>
                    <span className="text-slate-500">Arrives ready to run with pre-tuned firmware profiles and quick-start reference guides.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags strip */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-400">Tags:</span>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TECHNICAL SPECIFICATIONS */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Technical Specifications & Metrics
            </h3>

            {product.specifications && product.specifications.length > 0 ? (
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-100">
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-r border-slate-100">
                          {spec.key}
                        </td>
                        <td className="py-2.5 px-4 text-slate-800 font-medium">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-white">
                      <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-r border-slate-100">
                        SKU
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-mono">
                        {product.sku}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/60">
                      <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-r border-slate-100">
                        Category
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {product.categoryId?.name || 'General Catalog'}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-r border-slate-100">
                        Brand Partner
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {product.brandId?.name || 'ZYLO Select'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-md bg-slate-50 border border-slate-100 text-xs text-slate-500">
                Detailed technical specifications will be published soon by the manufacturer.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHIPPING & RETURNS */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 max-w-3xl text-xs text-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-md border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Delivery Windows</span>
                </div>
                <p className="leading-relaxed">
                  Orders placed before 2:00 PM EST ship the same business day. Standard tracked delivery arrives in 2–4 business days. Priority Express arrives next business day.
                </p>
              </div>

              <div className="p-4 rounded-md border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>30-Day Hassle-Free Returns</span>
                </div>
                <p className="leading-relaxed">
                  If you are not 100% satisfied with your item, return it within 30 days of delivery in original packaging for a full refund or exchange.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                Packaging & Handling
              </span>
              <p className="leading-relaxed">
                All shipments are packed using recyclable shock-absorbing protective foam and sealed with tamper-evident security tape. High-value tech equipment is insured against transit damage.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMER REVIEWS & RATINGS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews Summary Header Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-md bg-slate-50 border border-slate-200">
              {/* Left Column: Overall Rating Score (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center text-center lg:border-r border-slate-200 lg:pr-6 pb-6 lg:pb-0 border-b lg:border-b-0">
                <div className="text-5xl font-black text-slate-900 mb-2 tracking-tight">
                  {effectiveAverage > 0 ? effectiveAverage.toFixed(1) : '0.0'}
                </div>
                <div className="flex items-center text-amber-400 mb-2 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(effectiveAverage)
                          ? 'fill-amber-400 stroke-amber-400'
                          : 'stroke-slate-300 text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-500 mb-4">
                  {effectiveCount === 0
                    ? 'No reviews yet'
                    : `Based on ${effectiveCount} verified customer rating${effectiveCount === 1 ? '' : 's'}`}
                </span>

                <button
                  type="button"
                  onClick={handleOpenReviewModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>{myReview ? 'Edit Your Review' : 'Write a Review'}</span>
                </button>
              </div>

              {/* Right Column: Score Distribution Bars (8 cols) */}
              <div className="lg:col-span-8 flex flex-col justify-center space-y-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Rating Breakdown</span>
                  {ratingFilter && (
                    <button
                      type="button"
                      onClick={() => setRatingFilter(null)}
                      className="text-amber-600 hover:text-amber-700 text-xs font-semibold lowercase inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>clear filter ({ratingFilter}★)</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {(summary?.distribution || [
                  { stars: 5, count: 0, percentage: 0 },
                  { stars: 4, count: 0, percentage: 0 },
                  { stars: 3, count: 0, percentage: 0 },
                  { stars: 2, count: 0, percentage: 0 },
                  { stars: 1, count: 0, percentage: 0 },
                ]).map((row) => {
                  const isSelected = ratingFilter === row.stars;
                  return (
                    <button
                      key={row.stars}
                      type="button"
                      onClick={() => {
                        if (row.count === 0) return;
                        setRatingFilter(isSelected ? null : row.stars);
                        setCurrentPage(1);
                      }}
                      disabled={row.count === 0}
                      className={`flex items-center gap-3 text-xs w-full text-left py-1 px-2 rounded transition-colors ${
                        row.count > 0 ? 'cursor-pointer hover:bg-white' : 'opacity-60 cursor-default'
                      } ${isSelected ? 'bg-amber-50 ring-1 ring-amber-300' : ''}`}
                    >
                      <span className="w-14 text-slate-700 font-bold flex items-center gap-1">
                        {row.stars} <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                      </span>
                      <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isSelected ? 'bg-amber-500' : 'bg-amber-400'
                          }`}
                          style={{ width: `${row.percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-slate-500 font-medium">
                        {row.percentage}%
                      </span>
                      <span className="w-8 text-right text-slate-400 font-mono text-[11px]">
                        ({row.count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter / Sort Control Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Customer Reviews
                </h4>
                {ratingFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    <Filter className="w-3 h-3" />
                    <span>{ratingFilter} Stars Only</span>
                    <button
                      type="button"
                      onClick={() => setRatingFilter(null)}
                      className="hover:text-amber-950 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white border border-slate-200 rounded px-2.5 py-1.5 pr-7 text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Review Cards List */}
            {isLoadingReviews ? (
              <div className="space-y-4 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2 py-4 border-b border-slate-100">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/6" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-12 text-center rounded-md border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-700">
                  {ratingFilter
                    ? `No ${ratingFilter}-star reviews found`
                    : 'Be the first to review this product!'}
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {ratingFilter
                    ? 'Try clearing the filter to see reviews for other rating scores.'
                    : 'Share your genuine customer experience to help other verified shoppers.'}
                </p>
                <div>
                  {ratingFilter ? (
                    <button
                      type="button"
                      onClick={() => setRatingFilter(null)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
                    >
                      Clear Filter
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenReviewModal}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      <span>Write a Customer Review</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((r) => {
                  const hasVoted = userVotedIds.has(r._id);
                  const currentUserId = user?.id || (user as any)?._id;
                  const isOwner = Boolean(currentUserId && String(currentUserId) === String(r.userId));
                  const formattedDate = new Date(r.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div key={r._id} className="py-5 space-y-2.5">
                      {/* Customer Info & Verification */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          {r.customerAvatar ? (
                            <img
                              src={r.customerAvatar}
                              alt={r.customerName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                              {r.customerName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">
                              {r.customerName}
                            </span>
                            {r.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>Verified Purchase</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{formattedDate}</span>
                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(r._id)}
                              title="Delete your review"
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Star Rating & Review Title */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < r.rating
                                  ? 'fill-amber-400 stroke-amber-400'
                                  : 'stroke-slate-300 text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs">{r.title}</h5>
                      </div>

                      {/* Review Comment Body */}
                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl whitespace-pre-line">
                        {r.comment}
                      </p>

                      {/* Helpful Button Toolbar */}
                      <div className="pt-1 flex items-center gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleHelpful(r._id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
                            hasVoted
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <ThumbsUp
                            className={`w-3 h-3 ${hasVoted ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`}
                          />
                          <span>Helpful {r.helpfulCount > 0 ? `(${r.helpfulCount})` : ''}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="text-slate-500">
                  Showing page {currentPage} of {totalPages} ({totalCount} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-semibold"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Write / Edit Customer Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {myReview ? 'Edit Your Review' : 'Write a Customer Review'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              {/* Product Reference */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
                {product.thumbnailUrl || (product.images && product.images[0]?.url) ? (
                  <img
                    src={product.thumbnailUrl || product.images[0]?.url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded border border-slate-200 shrink-0"
                  />
                ) : null}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1 block">
                    {product.name}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    SKU: {product.sku}
                  </span>
                </div>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Overall Rating <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (formHoverRating || formRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setFormHoverRating(star)}
                          onMouseLeave={() => setFormHoverRating(0)}
                          onClick={() => setFormRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isFilled
                                ? 'fill-amber-400 stroke-amber-400'
                                : 'stroke-slate-300 text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-amber-700 ml-2">
                    {RATING_LABELS[formHoverRating || formRating]}
                  </span>
                </div>
              </div>

              {/* Review Headline Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Review Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="What's most important to know? (e.g. Exceptional build & finish)"
                  className="w-full text-xs px-3 py-2.5 rounded border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-800"
                />
              </div>

              {/* Review Comment Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Written Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="What did you like or dislike? How does it perform under daily workloads? Be specific and honest."
                  className="w-full text-xs px-3 py-2.5 rounded border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-800"
                />
                <div className="flex justify-end text-[10px] text-slate-400 mt-1">
                  <span>{formComment.length}/2000 characters</span>
                </div>
              </div>

              {formError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>{myReview ? 'Save Changes' : 'Submit Review'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTabsSection;
