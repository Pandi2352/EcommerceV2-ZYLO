import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Common SEO Data Transfer Object reusable across Categories, Brands, Products, and Pages.
 */
export class SeoDto {
  @ApiPropertyOptional({ description: 'Meta title for search engines' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta description snippet' })
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
