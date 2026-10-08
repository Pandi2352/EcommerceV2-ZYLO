import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeoDto } from '../../../common/dto/seo.dto';

export class ProductImageDto {
  @ApiProperty({ description: 'Hosted image URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: 'Accessibility alt text' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Whether this image is primary thumbnail', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Display ordering rank', default: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class ProductSpecificationDto {
  @ApiPropertyOptional({ description: 'Specification section/group', example: 'Technical' })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({ description: 'Attribute name', example: 'Battery Life' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Attribute value', example: 'Up to 22 hours' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class ProductVariantDto {
  @ApiProperty({ description: 'Variant unique SKU', example: 'IP16PM-256-BLK' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ description: 'Variant display title', example: 'Space Black / 256GB' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Variant unit price', example: 1199 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Promotional sale price', example: 1149 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number | null;

  @ApiProperty({ description: 'Physical units in stock', example: 45 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ description: 'Attribute map', example: { Color: 'Space Black', Storage: '256GB' } })
  @IsOptional()
  attributes?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Variant showcase image URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional({ description: 'Variant active state', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class VolumePricingTierDto {
  @ApiProperty({ description: 'Minimum bracket purchase quantity', example: 5 })
  @IsNumber()
  @Min(1)
  minQuantity: number;

  @ApiPropertyOptional({ description: 'Maximum bracket purchase quantity (null for unlimited)', example: 9 })
  @IsOptional()
  @IsNumber()
  maxQuantity?: number | null;

  @ApiPropertyOptional({ description: 'Percentage discount (e.g. 10 for 10%)', example: 10 })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Fixed unit price override in USD', example: 179.99 })
  @IsOptional()
  @IsNumber()
  unitPrice?: number | null;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Product marketing title', example: 'iPhone 16 Pro Max' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'URL slug (auto-generated if omitted)', example: 'iphone-16-pro-max' })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @ApiPropertyOptional({ description: 'Unique Stock Keeping Unit (auto-generated if omitted)', example: 'APL-IP16PM' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  sku?: string;

  @ApiPropertyOptional({ description: 'Universal Product Code / Barcode' })
  @IsOptional()
  @IsString()
  barcode?: string | null;

  @ApiPropertyOptional({ description: 'Full marketing description and HTML specs' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Short summary for search results & cards' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @ApiProperty({ description: 'Primary taxonomy category ObjectId' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Manufacturer brand partner ObjectId' })
  @IsString()
  @IsNotEmpty()
  brandId: string;

  @ApiPropertyOptional({ description: 'Tags array for discovery', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Pricing
  @ApiProperty({ description: 'Standard retail selling price', example: 1199 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ description: 'Promotional discount price', example: 1099 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number | null;

  @ApiPropertyOptional({ description: 'Internal inventory cost of goods' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number | null;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  // Inventory
  @ApiPropertyOptional({ description: 'Track stock inventory deduction', default: true })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @ApiProperty({ description: 'Current available stock quantity', default: 0 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ description: 'Low stock threshold trigger', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ description: 'Allow orders when out of stock', default: false })
  @IsOptional()
  @IsBoolean()
  allowBackorders?: boolean;

  // Media
  @ApiPropertyOptional({ description: 'Product image gallery', type: [ProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({ description: 'Primary card thumbnail image URL' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string | null;

  // Technical Specs
  @ApiPropertyOptional({ description: 'Technical specifications', type: [ProductSpecificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  specifications?: ProductSpecificationDto[];

  // Variants
  @ApiPropertyOptional({ description: 'Whether item has multiple variants', default: false })
  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean;

  @ApiPropertyOptional({ description: 'SKU variants matrix', type: [ProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @ApiPropertyOptional({ description: 'Tiered volume pricing rules', type: [VolumePricingTierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VolumePricingTierDto)
  volumeTiers?: VolumePricingTierDto[];

  // Merchandising
  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' })
  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @ApiPropertyOptional({ description: 'Featured storefront spotlight', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'New arrival badge spotlight', default: false })
  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  // SEO
  @ApiPropertyOptional({ description: 'SEO Metadata', type: SeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;
}
