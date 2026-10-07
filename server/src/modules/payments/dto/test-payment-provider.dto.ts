import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TestPaymentProviderDto {
  @ApiProperty({ description: 'Payment provider name (stripe, razorpay, paypal)', default: 'stripe' })
  @IsString()
  provider: string;

  @ApiPropertyOptional({ description: 'Secret key for testing' })
  @IsOptional()
  @IsString()
  secretKey?: string;

  @ApiPropertyOptional({ description: 'Publishable key / Key ID' })
  @IsOptional()
  @IsString()
  publishableKey?: string;
}
