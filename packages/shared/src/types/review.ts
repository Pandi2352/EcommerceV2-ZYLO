export interface ReviewItem {
  _id: string;
  productId: string;
  userId: string;
  customerName: string;
  customerAvatar: string | null;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  helpfulUserIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RatingDistributionItem {
  stars: number;
  count: number;
  percentage: number;
}

export interface ReviewSummary {
  ratingAverage: number;
  ratingCount: number;
  distribution: RatingDistributionItem[];
}

export interface ProductReviewsResponse {
  reviews: ReviewItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: ReviewSummary;
}

export interface CreateReviewPayload {
  rating: number;
  title: string;
  comment: string;
}

export interface QueryReviewsParams {
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'highest' | 'lowest' | 'helpful';
  ratingFilter?: number;
}

export interface AdminReviewProduct {
  _id: string;
  name: string;
  sku?: string;
  slug?: string;
  thumbnailUrl?: string;
  images?: { url: string; isPrimary?: boolean }[];
}

export interface AdminReviewItem extends Omit<ReviewItem, 'productId'> {
  productId: AdminReviewProduct | string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
}

export interface AdminReviewStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageRating: number;
}

export interface AdminReviewQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  productId?: string;
}

export interface AdminReviewsResponse {
  reviews: AdminReviewItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
