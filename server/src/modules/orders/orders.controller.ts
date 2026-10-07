import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place order and checkout active cart items' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async checkout(@CurrentUser() user: UserDocument, @Body() dto: CheckoutDto) {
    const order = await this.ordersService.checkout(user._id.toString(), user, dto);
    return {
      order,
      message: 'Order placed successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get current customer order history' })
  @ApiResponse({ status: 200, description: 'List of customer orders' })
  async getOrders(@CurrentUser() user: UserDocument, @Query() query: OrderQueryDto) {
    const data = await this.ordersService.getCustomerOrders(user._id.toString(), query);
    return { ...data };
  }

  @Get(':idOrNumber')
  @ApiOperation({ summary: 'Get order details by ID or Order Number' })
  @ApiResponse({ status: 200, description: 'Order breakdown' })
  async getOrder(@CurrentUser() user: UserDocument, @Param('idOrNumber') idOrNumber: string) {
    const order = await this.ordersService.getOrderByIdOrNumber(user._id.toString(), idOrNumber);
    return { order };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  async cancelOrder(
    @CurrentUser() user: UserDocument,
    @Param('id') orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    const order = await this.ordersService.cancelOrder(user._id.toString(), orderId, dto);
    return {
      order,
      message: 'Order cancelled successfully',
    };
  }
}
