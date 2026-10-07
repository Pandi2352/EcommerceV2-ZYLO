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
