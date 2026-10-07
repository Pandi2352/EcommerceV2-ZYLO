import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';

@ApiTags('Product Reviews')
@Controller('products/:productId/reviews')
export class ProductReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get paginated reviews and rating summary distribution for a product' })
  @ApiResponse({ status: 200, description: 'Product reviews and breakdown' })
  async getReviews(
    @Param('productId') productId: string,
    @Query() query: QueryReviewsDto,
  ) {
    return this.reviewsService.getProductReviews(productId, query);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @Get('my-review')
  @ApiOperation({ summary: 'Get current user review for product if exists' })
  @ApiResponse({ status: 200, description: 'Customer review or null' })
  async getMyReview(
    @Param('productId') productId: string,
    @CurrentUser() user: UserDocument,
  ) {
    const review = await this.reviewsService.getUserReviewForProduct(productId, user._id.toString());
    return { review };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit or edit review for a product' })
  @ApiResponse({ status: 200, description: 'Submitted review and updated rating' })
  async submitReview(
    @Param('productId') productId: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewsService.createOrUpdateReview(productId, user, dto);
    return {
      review,
      message: 'Review submitted successfully',
    };
  }
}

@ApiTags('Reviews Actions')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@Controller('reviews')
export class ReviewsActionsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':reviewId/helpful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vote review as helpful (toggle)' })
  @ApiResponse({ status: 200, description: 'Updated helpful count' })
  async voteHelpful(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.reviewsService.toggleHelpful(reviewId, user._id.toString());
  }

  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: UserDocument,
  ) {
    const isAdmin = (user as any).role === 'ADMIN' || (user as any).accountType === 'ADMIN';
    return this.reviewsService.deleteReview(reviewId, user._id.toString(), isAdmin);
  }
}

@ApiTags('Admin Reviews')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('stats')
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Admin: Get reviews moderation stats and rating breakdown' })
  async getStats() {
    return this.reviewsService.getStatsAdmin();
  }

  @Get()
  @RequirePermissions('reviews.view')
  @ApiOperation({ summary: 'Admin: Get all reviews across all products' })
  async getAllReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('productId') productId?: string,
  ) {
    return this.reviewsService.findAllAdmin({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
      search,
      productId,
    });
  }

  @Patch(':reviewId/status')
  @RequirePermissions('reviews.approve')
  @ApiOperation({ summary: 'Admin: Update review status (approve or reject)' })
  async updateStatus(
    @Param('reviewId') reviewId: string,
    @Body('status') status: 'APPROVED' | 'REJECTED' | 'PENDING',
  ) {
    const review = await this.reviewsService.updateStatusAdmin(reviewId, status);
    return { review, message: `Review marked as ${status}` };
  }

  @Delete(':reviewId')
  @RequirePermissions('reviews.delete')
  @ApiOperation({ summary: 'Admin: Delete an inappropriate review' })
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.reviewsService.deleteReview(reviewId, user._id.toString(), true);
  }
}
