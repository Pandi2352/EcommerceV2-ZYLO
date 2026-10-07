import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CouponDiscountType } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE20', description: 'Unique promotional coupon code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: '20% off all orders over $50', description: 'Coupon description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: CouponDiscountType,
    example: CouponDiscountType.PERCENTAGE,
    description: 'Discount model',
  })
  @IsEnum(CouponDiscountType)
  discountType: CouponDiscountType;

  @ApiProperty({ example: 20, description: 'Percentage or fixed dollar discount value' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ example: 50, description: 'Minimum order amount to qualify' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 30, description: 'Maximum cap for percentage discounts' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ example: '2026-10-01T00:00:00.000Z', description: 'Promo start date' })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z', description: 'Promo expiration date' })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ example: 500, description: 'Global total redemption limit' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({ example: 1, description: 'Redemptions allowed per customer' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  perUserLimit?: number;

  @ApiPropertyOptional({ example: true, description: 'Whether the coupon is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
