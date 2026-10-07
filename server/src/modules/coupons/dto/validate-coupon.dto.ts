import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ValidateCouponDto {
  @ApiProperty({ example: 'ZYLO20', description: 'Coupon code to validate' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 120.5, description: 'Cart subtotal against which to calculate discount' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiProperty({ example: 'userId123', required: false, description: 'Optional customer user ID for per-user limit check' })
  @IsString()
  @IsOptional()
  userId?: string;
}
