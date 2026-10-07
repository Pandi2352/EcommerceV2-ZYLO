import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentFailureDto } from './dto/payment-failure.dto';
import { TestPaymentProviderDto } from './dto/test-payment-provider.dto';

@ApiTags('Payments (Stripe)')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a Stripe Payment Intent for checkout or order' })
  @ApiResponse({ status: 201, description: 'Payment Intent created with client secret' })
  async createPaymentIntent(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(user._id.toString(), user, dto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm Stripe payment success and update order status' })
  @ApiResponse({ status: 200, description: 'Payment confirmed and order updated' })
  async confirmPayment(
    @CurrentUser() user: UserDocument,
    @Body() dto: ConfirmPaymentDto,
  ) {
    return this.paymentsService.confirmPayment(user._id.toString(), dto);
  }

  @Post('fail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record payment failure / card decline details' })
  @ApiResponse({ status: 200, description: 'Failure details logged' })
  async recordFailure(
    @CurrentUser() user: UserDocument,
    @Body() dto: PaymentFailureDto,
  ) {
    return this.paymentsService.handlePaymentFailure(user._id.toString(), dto);
  }

  @Post('retry/:orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a fresh payment intent to retry a failed/pending order' })
  @ApiResponse({ status: 200, description: 'New payment intent generated for order' })
  async retryPayment(
    @CurrentUser() user: UserDocument,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.retryPayment(user._id.toString(), user, orderId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment transactions and gateway logs for an order' })
  @ApiResponse({ status: 200, description: 'Order transactions list' })
  async getOrderTransactions(@Param('orderId') orderId: string) {
    return this.paymentsService.getOrderTransactions(orderId);
  }

  @StaffOnly()
  @Post('test-provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test payment provider credentials connection (Admin)' })
  @ApiResponse({ status: 200, description: 'Provider credentials verification result' })
  async testProvider(@Body() dto: TestPaymentProviderDto) {
    return this.paymentsService.testProviderConnection(dto.provider || 'stripe', dto);
  }
}
