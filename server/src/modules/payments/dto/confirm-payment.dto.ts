import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Stripe Payment Intent ID e.g. pi_...' })
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;

  @ApiPropertyOptional({ description: 'Optional linked Order ID' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Card brand (visa, mastercard, amex)' })
  @IsOptional()
  @IsString()
  cardBrand?: string;

  @ApiPropertyOptional({ description: 'Card last 4 digits' })
  @IsOptional()
  @IsString()
  cardLast4?: string;
}
