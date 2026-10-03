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

export class CategoryBadgeDto {
  @ApiProperty({ description: 'Badge display text (e.g. HOT, NEW)', example: 'NEW' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({
    description: 'Badge color variant',
    enum: ['indigo', 'emerald', 'amber', 'rose'],
    default: 'indigo',
  })
  @IsOptional()
  @IsEnum(['indigo', 'emerald', 'amber', 'rose'])
  color?: string;
}

export class CategorySeoDto {
  @ApiPropertyOptional({ description: 'Meta title for Google search results' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta description snippet' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Keywords list for search engine indexing', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ description: 'Canonical URL override' })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({ description: 'OpenGraph preview image URL' })
  @IsOptional()
  @IsString()
  ogImage?: string | null;
}

export class SmartCollectionRuleDto {
  @ApiProperty({ description: 'Target attribute or property name', example: 'tags' })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({ description: 'Rule comparison operator', example: 'contains' })
  @IsString()
  @IsNotEmpty()
  operator: string;

  @ApiProperty({ description: 'Comparison operand value', example: 'summer-sale' })
  @IsString()
  value: string;
}

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Smartphones & Tablets' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Custom slug (auto-generated if omitted)',
    example: 'smartphones-tablets',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'MongoDB ObjectId of parent category (null for Root category)',
    example: '60d0fe4f5311236168a109ca',
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({ description: 'Category icon SVG or PNG URL' })
  @IsOptional()
  @IsString()
  iconUrl?: string | null;

  @ApiPropertyOptional({ description: 'Category square thumbnail image URL' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ description: 'Desktop wide hero banner URL (1920x400)' })
  @IsOptional()
  @IsString()
  bannerDesktopUrl?: string | null;

  @ApiPropertyOptional({ description: 'Mobile hero banner URL (800x400)' })
  @IsOptional()
  @IsString()
  bannerMobileUrl?: string | null;

  @ApiPropertyOptional({ description: 'Image accessibility alt text' })
  @IsOptional()
  @IsString()
  imageAltText?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({ description: 'Display sorting order', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Whether to show in main navbar mega menu', default: true })
  @IsOptional()
  @IsBoolean()
  includeInMenu?: boolean;

  @ApiPropertyOptional({ description: 'Whether to feature in homepage curated carousel', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Optional promotional badge' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryBadgeDto)
  badge?: CategoryBadgeDto | null;

  @ApiPropertyOptional({ description: 'Expiry date for time-limited promotional badge' })
  @IsOptional()
  @IsString()
  badgeExpiresAt?: string | null;

  @ApiPropertyOptional({ description: 'Whether this is a dynamic smart collection', default: false })
  @IsOptional()
  @IsBoolean()
  isSmartCollection?: boolean;

  @ApiPropertyOptional({ description: 'Conditions join type for smart rules', enum: ['ALL', 'ANY'], default: 'ALL' })
  @IsOptional()
  @IsEnum(['ALL', 'ANY'])
  rulesCondition?: 'ALL' | 'ANY';

  @ApiPropertyOptional({ description: 'List of smart collection matching rules', type: [SmartCollectionRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SmartCollectionRuleDto)
  rules?: SmartCollectionRuleDto[];

  @ApiPropertyOptional({
    description: 'Filterable product attribute keys for this category',
    example: ['brand', 'color', 'storage'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filterableAttributes?: string[];

  @ApiPropertyOptional({ description: 'SEO and Social metadata' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CategorySeoDto)
  seo?: CategorySeoDto;
}
