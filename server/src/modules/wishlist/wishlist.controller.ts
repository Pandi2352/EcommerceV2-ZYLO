import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { MergeWishlistDto } from './dto/merge-wishlist.dto';

@ApiTags('Wishlist')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current customer wishlist' })
  @ApiResponse({ status: 200, description: 'Populated wishlist items' })
  async getWishlist(@CurrentUser() user: UserDocument) {
    const data = await this.wishlistService.getPopulatedWishlist(user._id.toString());
    return { ...data };
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add product item to customer wishlist' })
  @ApiResponse({ status: 200, description: 'Updated wishlist' })
  async addItem(@CurrentUser() user: UserDocument, @Body() dto: AddWishlistItemDto) {
    const data = await this.wishlistService.addItem(user._id.toString(), dto);
    return { ...data, message: 'Item added to wishlist' };
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from customer wishlist' })
  @ApiResponse({ status: 200, description: 'Updated wishlist' })
  async removeItem(@CurrentUser() user: UserDocument, @Param('id') itemId: string) {
    const data = await this.wishlistService.removeItem(user._id.toString(), itemId);
    return { ...data, message: 'Item removed from wishlist' };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all items from customer wishlist' })
  @ApiResponse({ status: 200, description: 'Empty wishlist' })
  async clearWishlist(@CurrentUser() user: UserDocument) {
    const data = await this.wishlistService.clearWishlist(user._id.toString());
    return { ...data, message: 'Wishlist cleared' };
  }

  @Post('items/:id/move-to-cart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move item from wishlist to active cart' })
  @ApiResponse({ status: 200, description: 'Updated wishlist and cart' })
  async moveToCart(@CurrentUser() user: UserDocument, @Param('id') itemId: string) {
    const data = await this.wishlistService.moveToCart(user._id.toString(), itemId);
    return { ...data, message: 'Item moved to cart' };
  }

  @Post('move-all-to-cart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move all items from wishlist to cart' })
  @ApiResponse({ status: 200, description: 'Updated wishlist and cart' })
  async moveAllToCart(@CurrentUser() user: UserDocument) {
    const data = await this.wishlistService.moveAllToCart(user._id.toString());
    return { ...data, message: `${data.movedCount} items moved to cart` };
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge guest wishlist into authenticated user wishlist' })
  @ApiResponse({ status: 200, description: 'Merged wishlist' })
  async mergeWishlist(@CurrentUser() user: UserDocument, @Body() dto: MergeWishlistDto) {
    const data = await this.wishlistService.mergeWishlist(user._id.toString(), dto);
    return { ...data, message: 'Guest wishlist merged' };
  }
}
