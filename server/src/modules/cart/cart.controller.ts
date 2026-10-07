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
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current customer cart and calculated summary' })
  @ApiResponse({ status: 200, description: 'Cart calculation result' })
  async getCart(@CurrentUser() user: UserDocument) {
    const data = await this.cartService.getCalculatedCart(user._id.toString());
    return { ...data };
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add product item to cart' })
  @ApiResponse({ status: 200, description: 'Updated cart' })
  async addItem(@CurrentUser() user: UserDocument, @Body() dto: AddToCartDto) {
    const data = await this.cartService.addItem(user._id.toString(), dto);
    return { ...data, message: 'Item added to cart' };
  }

  @Patch('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update cart item quantity or selection' })
  @ApiResponse({ status: 200, description: 'Updated cart' })
  async updateItem(
    @CurrentUser() user: UserDocument,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const data = await this.cartService.updateItem(user._id.toString(), itemId, dto);
    return { ...data, message: 'Cart updated' };
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Updated cart' })
  async removeItem(@CurrentUser() user: UserDocument, @Param('id') itemId: string) {
    const data = await this.cartService.removeItem(user._id.toString(), itemId);
    return { ...data, message: 'Item removed from cart' };
  }

  @Post('items/:id/save-for-later')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move item to Saved for Later (Amazon feature)' })
  @ApiResponse({ status: 200, description: 'Updated cart' })
  async saveForLater(@CurrentUser() user: UserDocument, @Param('id') itemId: string) {
    const data = await this.cartService.saveForLater(user._id.toString(), itemId);
    return { ...data, message: 'Item saved for later' };
  }

  @Post('saved-items/:id/move-to-cart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move item from Saved for Later back to Cart' })
  @ApiResponse({ status: 200, description: 'Updated cart' })
  async moveToCart(@CurrentUser() user: UserDocument, @Param('id') itemId: string) {
    const data = await this.cartService.moveToCart(user._id.toString(), itemId);
    return { ...data, message: 'Item moved to cart' };
  }

  @Delete('saved-items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete item from Saved for Later' })
  @ApiResponse({ status: 200, description: 'Updated cart' })
  async deleteSavedItem(@CurrentUser() user: UserDocument, @Param('id') itemId: string) {
    const data = await this.cartService.deleteSavedItem(user._id.toString(), itemId);
    return { ...data, message: 'Saved item removed' };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all items from active cart' })
  @ApiResponse({ status: 200, description: 'Empty cart' })
  async clearCart(@CurrentUser() user: UserDocument) {
    const data = await this.cartService.clearCart(user._id.toString());
    return { ...data, message: 'Cart cleared' };
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge guest cart items into customer cart on sign-in' })
  @ApiResponse({ status: 200, description: 'Merged cart' })
  async mergeCart(@CurrentUser() user: UserDocument, @Body() dto: MergeCartDto) {
    const data = await this.cartService.mergeCart(user._id.toString(), dto.items);
    return { ...data, message: 'Cart synchronized' };
  }

  @Post('coupon')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply promotional coupon discount' })
  @ApiResponse({ status: 200, description: 'Updated cart with discount' })
  async applyCoupon(@CurrentUser() user: UserDocument, @Body() dto: ApplyCouponDto) {
    const data = await this.cartService.applyCoupon(user._id.toString(), dto.code);
    return { ...data, message: 'Coupon applied successfully' };
  }

  @Delete('coupon')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove applied coupon discount' })
  @ApiResponse({ status: 200, description: 'Updated cart without discount' })
  async removeCoupon(@CurrentUser() user: UserDocument) {
    const data = await this.cartService.removeCoupon(user._id.toString());
    return { ...data, message: 'Coupon removed' };
  }
}
