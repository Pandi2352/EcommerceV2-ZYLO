import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AdminInventoryQueryDto {
  @ApiPropertyOptional({ description: 'Search by product name, SKU, or variant SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by stock health status',
    enum: ['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'],
    default: 'ALL',
  })
  @IsOptional()
  @IsIn(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'])
  status?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'ALL';

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by brand ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({
    description: 'Sort criteria',
    enum: ['stock_asc', 'stock_desc', 'name', 'recent', 'price_desc'],
    default: 'stock_asc',
  })
  @IsOptional()
  @IsIn(['stock_asc', 'stock_desc', 'name', 'recent', 'price_desc'])
  sortBy?: 'stock_asc' | 'stock_desc' | 'name' | 'recent' | 'price_desc' = 'stock_asc';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
