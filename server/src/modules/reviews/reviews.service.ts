import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';

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

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  /**
   * Recalculates product ratingAverage and ratingCount based on persisted reviews
   */
  async recalculateProductRating(productId: string | Types.ObjectId): Promise<{ ratingAverage: number; ratingCount: number }> {
    const prodObjectId = new Types.ObjectId(productId);
    const stats = await this.reviewModel.aggregate([
      { $match: { productId: prodObjectId, status: 'APPROVED' } },
      {
        $group: {
          _id: '$productId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    let ratingAverage = 0;
    let ratingCount = 0;

    if (stats.length > 0 && stats[0].count > 0) {
      ratingAverage = Math.round(stats[0].avgRating * 10) / 10;
      ratingCount = stats[0].count;
    }

    await this.productModel.findByIdAndUpdate(prodObjectId, {
      $set: { ratingAverage, ratingCount },
    });

    return { ratingAverage, ratingCount };
  }

  /**
   * Compute full 5-to-1 star distribution and counts
   */
  async getRatingDistribution(productId: string | Types.ObjectId): Promise<ReviewSummary> {
    const prodObjectId = new Types.ObjectId(productId);
    const countsByStar = await this.reviewModel.aggregate([
      { $match: { productId: prodObjectId, status: 'APPROVED' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const starMap: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalReviews = 0;
    let sumScore = 0;

    for (const item of countsByStar) {
      const star = Number(item._id);
      if (star >= 1 && star <= 5) {
        starMap[star] = item.count;
        totalReviews += item.count;
        sumScore += star * item.count;
      }
    }

    const ratingAverage = totalReviews > 0 ? Math.round((sumScore / totalReviews) * 10) / 10 : 0;

    const distribution: RatingDistributionItem[] = [5, 4, 3, 2, 1].map((stars) => {
      const count = starMap[stars] || 0;
      const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return { stars, count, percentage };
    });

    return {
      ratingAverage,
      ratingCount: totalReviews,
      distribution,
    };
  }

  /**
   * Submit or update a product review
   */
  async createOrUpdateReview(
    productId: string,
    user: UserDocument,
    dto: CreateReviewDto,
  ): Promise<ReviewDocument> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const userId = user._id.toString();

    // Check if customer has a verified delivered order for this product
    const deliveredOrder = await this.orderModel.findOne({
      userId,
      orderStatus: OrderStatus.DELIVERED,
      'items.productId': new Types.ObjectId(productId),
    });
    const isVerifiedPurchase = Boolean(deliveredOrder);

    const displayName =
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email?.split('@')[0] ||
      'Customer';

    const review = await this.reviewModel.findOneAndUpdate(
      {
        productId: new Types.ObjectId(productId),
        userId,
      },
      {
        $set: {
          rating: dto.rating,
          title: dto.title.trim(),
          comment: dto.comment.trim(),
          customerName: displayName,
          customerAvatar: user.avatarUrl || null,
          isVerifiedPurchase,
        },
        $setOnInsert: {
          helpfulCount: 0,
          helpfulUserIds: [],
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    // Live re-calculate average rating and rating count
    await this.recalculateProductRating(productId);

    return review;
  }

  /**
   * Get reviews with pagination, sorting, star filter, and summary breakdown
   */
  async getProductReviews(productId: string, query: QueryReviewsDto) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const { page = 1, limit = 10, sortBy = 'recent', ratingFilter } = query;
    const filter: Record<string, any> = {
      productId: new Types.ObjectId(productId),
      status: 'APPROVED',
    };

    if (ratingFilter && ratingFilter >= 1 && ratingFilter <= 5) {
      filter.rating = ratingFilter;
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (sortBy === 'highest') {
      sortOption.rating = -1;
      sortOption.createdAt = -1;
    } else if (sortBy === 'lowest') {
      sortOption.rating = 1;
      sortOption.createdAt = -1;
    } else if (sortBy === 'helpful') {
      sortOption.helpfulCount = -1;
      sortOption.createdAt = -1;
    } else {
      // default: recent
      sortOption.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [reviews, totalCount, summary] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.reviewModel.countDocuments(filter),
      this.getRatingDistribution(productId),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      reviews,
      total: totalCount,
      page,
      limit,
      totalPages,
      summary,
    };
  }

  /**
   * Retrieve current user's review for this product if already reviewed
   */
  async getUserReviewForProduct(productId: string, userId: string): Promise<ReviewDocument | null> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    return this.reviewModel.findOne({
      productId: new Types.ObjectId(productId),
      userId,
    });
  }

  /**
   * Toggle helpful vote on a review
   */
  async toggleHelpful(reviewId: string, userId: string): Promise<{ reviewId: string; helpfulCount: number; hasVoted: boolean }> {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new BadRequestException('Invalid review ID');
    }

    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const userIdStr = String(userId);
    const existingIndex = review.helpfulUserIds.indexOf(userIdStr);
    let hasVoted = false;

    if (existingIndex > -1) {
      // Remove vote
      review.helpfulUserIds.splice(existingIndex, 1);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
      hasVoted = false;
    } else {
      // Add vote
      review.helpfulUserIds.push(userIdStr);
      review.helpfulCount = (review.helpfulCount || 0) + 1;
      hasVoted = true;
    }

    await review.save();

    return {
      reviewId,
      helpfulCount: review.helpfulCount,
      hasVoted,
    };
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string, userId: string, isAdmin = false): Promise<{ success: boolean }> {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new BadRequestException('Invalid review ID');
    }

    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (!isAdmin && review.userId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to delete this review');
    }

    const productId = review.productId;
    await this.reviewModel.findByIdAndDelete(reviewId);
    await this.recalculateProductRating(productId);

    return { success: true };
  }

  /**
   * Admin: List all reviews across the store
   */
  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    productId?: string;
  }) {
    const { page = 1, limit = 20, status, search, productId } = query;
    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }
    if (productId && Types.ObjectId.isValid(productId)) {
      filter.productId = new Types.ObjectId(productId);
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { customerName: regex },
        { title: regex },
        { comment: regex },
      ];
    }

    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .populate('productId', 'name sku slug images thumbnailUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.reviewModel.countDocuments(filter),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin: Approve or Reject a review
   */
  async updateStatusAdmin(
    reviewId: string,
    status: 'APPROVED' | 'REJECTED' | 'PENDING',
  ): Promise<ReviewDocument> {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new BadRequestException('Invalid review ID');
    }

    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = status;
    await review.save();

    // Re-sync product rating average based on approved reviews
    await this.recalculateProductRating(review.productId);

    return review;
  }

  /**
   * Admin: Get summary statistics for moderation dashboard
   */
  async getStatsAdmin() {
    const [total, pending, approved, rejected, ratingAgg] = await Promise.all([
      this.reviewModel.countDocuments(),
      this.reviewModel.countDocuments({ status: 'PENDING' }),
      this.reviewModel.countDocuments({ status: 'APPROVED' }),
      this.reviewModel.countDocuments({ status: 'REJECTED' }),
      this.reviewModel.aggregate([
        { $match: { status: 'APPROVED' } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
          },
        },
      ]),
    ]);

    const avgRating =
      ratingAgg.length > 0 && ratingAgg[0].avgRating
        ? Math.round(ratingAgg[0].avgRating * 10) / 10
        : 0;

    return {
      totalReviews: total,
      pendingReviews: pending,
      approvedReviews: approved,
      rejectedReviews: rejected,
      averageRating: avgRating,
    };
  }
}
