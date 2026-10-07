import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiPropertyOptional({ description: 'Order ID if intent is for an existing order' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiProperty({ description: 'Amount to charge in standard currency units (e.g. 19.99)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.5)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code e.g. USD, EUR, INR', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Optional metadata key-values' })
  @IsOptional()
  metadata?: Record<string, any>;
}
