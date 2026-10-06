import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryProductDto {
  @ApiPropertyOptional({ description: 'Search keywords across name, SKU, tags, description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category ObjectId' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by multiple category ObjectIds (comma-separated)' })
  @IsOptional()
  @IsString()
  categoryIds?: string;

  @ApiPropertyOptional({ description: 'Filter by brand ObjectId' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Filter by multiple brand ObjectIds (comma-separated)' })
  @IsOptional()
  @IsString()
  brandIds?: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @ApiPropertyOptional({ description: 'Filter by featured spotlight status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Filter by new arrival status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isNewArrival?: boolean;

  @ApiPropertyOptional({ description: 'Filter for items currently in stock' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  inStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter by minimum customer star rating (e.g. 4.0)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRating?: number;

  @ApiPropertyOptional({ enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] })
  @IsOptional()
  @IsEnum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'])
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

  @ApiPropertyOptional({ description: 'Minimum base price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum base price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Sorting strategy',
    enum: ['newest', 'price_asc', 'price_desc', 'name_asc', 'rating', 'stock'],
    default: 'newest',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'rating' | 'stock';

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
