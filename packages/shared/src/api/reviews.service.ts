import { api, unwrap } from './client';
import type {
  CreateReviewPayload,
  ProductReviewsResponse,
  QueryReviewsParams,
  ReviewItem,
} from '../types/review';

export const reviewsService = {
  getProductReviews: (productId: string, params?: QueryReviewsParams) =>
    unwrap<ProductReviewsResponse>(
      api.get(`/products/${productId}/reviews`, { params }),
    ),

  getMyReview: (productId: string) =>
    unwrap<{ review: ReviewItem | null }>(
      api.get(`/products/${productId}/reviews/my-review`),
    ),

  submitReview: (productId: string, payload: CreateReviewPayload) =>
    unwrap<{ review: ReviewItem; message: string }>(
      api.post(`/products/${productId}/reviews`, payload),
    ),

  voteHelpful: (reviewId: string) =>
    unwrap<{ reviewId: string; helpfulCount: number; hasVoted: boolean }>(
      api.post(`/reviews/${reviewId}/helpful`),
    ),

  deleteReview: (reviewId: string) =>
    unwrap<{ success: boolean }>(
      api.delete(`/reviews/${reviewId}`),
    ),

  // Admin Moderation Operations
  getAdminStats: () =>
    unwrap<import('../types/review').AdminReviewStats>(
      api.get('/admin/reviews/stats'),
    ),

  getAdminReviews: (params?: import('../types/review').AdminReviewQuery) =>
    unwrap<import('../types/review').AdminReviewsResponse>(
      api.get('/admin/reviews', { params }),
    ),

  updateAdminStatus: (reviewId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') =>
    unwrap<{ review: import('../types/review').AdminReviewItem; message: string }>(
      api.patch(`/admin/reviews/${reviewId}/status`, { status }),
    ),

  deleteAdminReview: (reviewId: string) =>
    unwrap<{ success: boolean }>(
      api.delete(`/admin/reviews/${reviewId}`),
    ),
};
