import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BundleItemConfigDto {
  @ApiProperty({ description: 'Referenced Product ID', example: '6ac5cfa90a5104a70a030e0d' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Optional variant SKU override', example: 'APL-IP16PM-256' })
  @IsOptional()
  @IsString()
  variantSku?: string | null;

  @ApiPropertyOptional({ description: 'Specific discount percentage for this line item (0-100)', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Whether shoppers can uncheck this item from the kit', default: true })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @ApiPropertyOptional({ description: 'Display ordering rank', default: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class CreateBundleDto {
  @ApiProperty({ description: 'Bundle commercial title', example: 'iPhone 16 Pro Max Creator Suite' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Unique URL slug (auto-generated if omitted)', example: 'iphone-16-pro-creator-suite' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Storefront badge label', default: 'Frequently Bought Together', example: 'Frequently Bought Together' })
  @IsOptional()
  @IsString()
  badgeText?: string;

  @ApiPropertyOptional({ description: 'Bundle marketing summary' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Primary anchor Product ID that displays this bundle on its PDP', example: '6ac5cfa90a5104a70a030e0d' })
  @IsString()
  @IsNotEmpty()
  primaryProductId: string;

  @ApiProperty({ description: 'List of bundled companion products', type: [BundleItemConfigDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemConfigDto)
  items: BundleItemConfigDto[];

  @ApiPropertyOptional({ description: 'Global bundle discount percentage applied to all items', default: 10, example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bundleDiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Optional fixed package price override ($)', example: 1299.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bundleFixedPrice?: number | null;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Display sort weight', default: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
