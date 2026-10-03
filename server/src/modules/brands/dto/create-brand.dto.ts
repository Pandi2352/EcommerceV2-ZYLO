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

export class BrandSeoDto {
  @ApiPropertyOptional({ description: 'Meta title for search engine indexing' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta description preview' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'SEO keywords array', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ description: 'Canonical URL reference' })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({ description: 'OpenGraph preview image URL' })
  @IsOptional()
  @IsString()
  ogImage?: string | null;
}

export class CreateBrandDto {
  @ApiProperty({ description: 'Brand manufacturer name', example: 'Sony' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly brand slug (auto-generated if omitted)',
    example: 'sony',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @ApiPropertyOptional({ description: 'Brand story or description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Brand square logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @ApiPropertyOptional({ description: 'Brand widescreen showcase banner URL' })
  @IsOptional()
  @IsString()
  bannerUrl?: string | null;

  @ApiPropertyOptional({ description: 'Official corporate brand website URL', example: 'https://www.sony.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Country of origin / manufacturing headquarters', example: 'Japan' })
  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @ApiPropertyOptional({ description: 'Featured brand showcase flag', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({ description: 'Manual sort ordering rank (lower displays first)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'SEO and search indexing metadata', type: BrandSeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandSeoDto)
  seo?: BrandSeoDto;
}
