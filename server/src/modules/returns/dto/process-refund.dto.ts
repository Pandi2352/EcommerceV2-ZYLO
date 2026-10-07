import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ProcessRefundDto {
  @ApiPropertyOptional({
    description: 'Transaction ID from payment gateway (Stripe/PayPal/Cash)',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({
    description: 'Custom override refund amount (defaults to totalRefundAmount)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Refund notes or reason description',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
