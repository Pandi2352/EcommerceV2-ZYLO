import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PaymentsService } from './payments.service';

@ApiTags('Payments Webhook')
@Controller('payments/webhook')
export class PaymentsWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe Webhook Listener for asynchronous payment events' })
  @ApiResponse({ status: 200, description: 'Webhook event processed' })
  async handleWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.paymentsService.processWebhook(payload, signature);
  }
}
