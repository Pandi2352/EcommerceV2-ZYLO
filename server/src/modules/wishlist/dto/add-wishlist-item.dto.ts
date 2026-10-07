import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddWishlistItemDto {
  @ApiProperty({ description: 'MongoDB Product ID', example: '66fa3b1d5b3f2e1a9c8b4567' })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  productId: string;

  @ApiPropertyOptional({ description: 'Optional specific variant SKU', example: 'PROD-BLK-M' })
  @IsOptional()
  @IsString()
  variantSku?: string;
}
