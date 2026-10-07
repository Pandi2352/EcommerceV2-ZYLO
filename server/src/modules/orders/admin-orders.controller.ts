import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { OrdersService } from './orders.service';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderTrackingDto } from './dto/update-order-tracking.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

@ApiTags('Admin Orders')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('metrics')
  @RequirePermissions('orders.view')
  @ApiOperation({ summary: 'Admin: Get order counts, status breakdowns, and revenue KPIs' })
  @ApiResponse({ status: 200, description: 'Order KPI metrics' })
  async getMetrics() {
    return this.ordersService.getAdminOrderMetrics();
  }

  @Get('export')
  @RequirePermissions('orders.export')
  @ApiOperation({ summary: 'Admin: Export orders as CSV or JSON' })
  @ApiResponse({ status: 200, description: 'Export payload' })
  async exportOrders(@Query('format') format: 'json' | 'csv' = 'json') {
    return this.ordersService.exportOrdersAdmin(format);
  }

  @Get()
  @RequirePermissions('orders.view')
  @ApiOperation({ summary: 'Admin: List all customer orders with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated orders with metrics' })
  async listOrders(@Query() query: AdminOrderQueryDto) {
    return this.ordersService.getAdminOrders(query);
  }

  @Get(':id')
  @RequirePermissions('orders.view')
  @ApiOperation({ summary: 'Admin: Get full order details by ID or Order Number' })
  @ApiResponse({ status: 200, description: 'Full order details' })
  async getOrder(@Param('id') id: string) {
    const order = await this.ordersService.getAdminOrderById(id);
    return { order };
  }

  @Patch(':id/status')
  @RequirePermissions('orders.edit')
  @ApiOperation({ summary: 'Admin: Update order fulfillment status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const order = await this.ordersService.updateOrderStatusAdmin(id, dto);
    return {
      order,
      message: `Order status updated to ${order.orderStatus}`,
    };
  }

  @Patch(':id/tracking')
  @RequirePermissions('orders.edit')
  @ApiOperation({ summary: 'Admin: Update shipping courier and tracking number' })
  @ApiResponse({ status: 200, description: 'Order tracking info updated' })
  async updateTracking(@Param('id') id: string, @Body() dto: UpdateOrderTrackingDto) {
    const order = await this.ordersService.updateOrderTrackingAdmin(id, dto);
    return {
      order,
      message: 'Tracking details assigned successfully',
    };
  }

  @Patch(':id/payment')
  @RequirePermissions('orders.edit')
  @ApiOperation({ summary: 'Admin: Update order payment status' })
  @ApiResponse({ status: 200, description: 'Order payment status updated' })
  async updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto) {
    const order = await this.ordersService.updateOrderPaymentAdmin(id, dto);
    return {
      order,
      message: `Payment status marked as ${order.paymentStatus}`,
    };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('orders.cancel')
  @ApiOperation({ summary: 'Admin: Cancel order and restore stock' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  async cancelOrder(@Param('id') id: string, @Body() dto: CancelOrderDto) {
    const order = await this.ordersService.updateOrderStatusAdmin(id, {
      status: 'CANCELLED' as any,
      note: dto.reason || 'Cancelled by admin',
    });
    return {
      order,
      message: 'Order cancelled and stock restored successfully',
    };
  }
}
