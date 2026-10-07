import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  ThumbsUp,
  Package,
  Calendar,
  Trash2,
} from 'lucide-react';
import type { AdminReviewItem } from '@shared/types/review';
import { Drawer } from '@shared/ui/Drawer';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { reviewsService } from '@shared/api/reviews.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  review: AdminReviewItem | null;
  onStatusUpdated: () => void;
  onDeleteRequested: (review: AdminReviewItem) => void;
}

export const ReviewDetailsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  review,
  onStatusUpdated,
  onDeleteRequested,
}) => {
  const [updating, setUpdating] = useState(false);

  if (!review) return null;

  const product = typeof review.productId === 'object' ? review.productId : null;
  const productImg =
    product?.thumbnailUrl ||
    product?.images?.find((i) => i.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    '';

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    try {
      setUpdating(true);
      await reviewsService.updateAdminStatus(review._id, status);
      toast.success(`Review status changed to ${status}`);
      onStatusUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update review status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Review Moderation Details"
      description="Inspect customer review contents, verified purchase status, and set publication visibility."
      size="lg"
    >
      <div className="space-y-6">
        {/* Status Banner */}
        <div
          className={`p-4 rounded-md border flex items-center justify-between ${
            review.status === 'APPROVED'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : review.status === 'REJECTED'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {review.status === 'APPROVED' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {review.status === 'REJECTED' && <XCircle className="w-5 h-5 text-rose-600" />}
            {review.status === 'PENDING' && <Clock className="w-5 h-5 text-amber-600" />}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                Status: {review.status}
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                {review.status === 'APPROVED' && 'This review is published and visible on the storefront.'}
                {review.status === 'REJECTED' && 'This review is hidden from public storefront views.'}
                {review.status === 'PENDING' && 'This review is awaiting staff approval.'}
              </p>
            </div>
          </div>
        </div>

        {/* Product Information Card */}
        {product && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Associated Product
            </p>
            <div className="flex items-center gap-3">
              {productImg ? (
                <img
                  src={productImg}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded-md border border-slate-200 bg-white shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-md border border-slate-200 bg-white flex items-center justify-center shrink-0 text-slate-400">
                  <Package className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-slate-900 truncate">{product.name}</h4>
                {product.sku && (
                  <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {product.sku}</p>
                )}
                {product.slug && (
                  <span className="text-xs text-indigo-600 font-medium hover:underline inline-block mt-0.5">
                    /{product.slug}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviewer & Submission Info */}
        <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Customer Information
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {review.customerName ? review.customerName.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{review.customerName || 'Anonymous Customer'}</p>
                <p className="text-xs text-slate-400 font-mono">User ID: {review.userId}</p>
              </div>
            </div>

            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Buyer
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(review.createdAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
              {review.helpfulCount || 0} helpful votes
            </span>
          </div>
        </div>

        {/* Review Rating & Content */}
        <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Review Content
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= review.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-bold text-slate-800">{review.rating} out of 5 stars</span>
          </div>

          {/* Title & Comment */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-900">{review.title}</h3>
            <p className="text-sm text-slate-700 whitespace-pre-line mt-2 leading-relaxed bg-slate-50/70 p-3 rounded-md border border-slate-100">
              {review.comment}
            </p>
          </div>
        </div>

        {/* Moderation Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDeleteRequested(review)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
            disabled={updating}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Review
          </Button>

          <div className="flex items-center gap-2">
            {review.status !== 'REJECTED' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus('REJECTED')}
                isLoading={updating}
                className="text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject
              </Button>
            )}

            {review.status !== 'APPROVED' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleUpdateStatus('APPROVED')}
                isLoading={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Approve & Publish
              </Button>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
