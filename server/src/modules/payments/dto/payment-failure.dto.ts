import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentFailureDto {
  @ApiProperty({ description: 'Stripe Payment Intent ID' })
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;

  @ApiPropertyOptional({ description: 'Error code e.g. card_declined, expired_card, insufficient_funds' })
  @IsOptional()
  @IsString()
  errorCode?: string;

  @ApiProperty({ description: 'Human-readable failure message' })
  @IsNotEmpty()
  @IsString()
  errorMessage: string;

  @ApiPropertyOptional({ description: 'Linked Order ID' })
  @IsOptional()
  @IsString()
  orderId?: string;
}
