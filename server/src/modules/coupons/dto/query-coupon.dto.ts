import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponDiscountType } from '../schemas/coupon.schema';

export class QueryCouponDto {
  @ApiPropertyOptional({ example: 'SAVE', description: 'Search by coupon code or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: CouponDiscountType,
    description: 'Filter by discount type',
  })
  @IsEnum(CouponDiscountType)
  @IsOptional()
  discountType?: CouponDiscountType;

  @ApiPropertyOptional({
    enum: ['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'],
    description: 'Filter by coupon operational status',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
