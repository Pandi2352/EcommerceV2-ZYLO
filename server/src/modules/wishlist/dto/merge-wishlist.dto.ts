import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class GuestWishlistItemDto {
  @ApiProperty({ description: 'MongoDB Product ID' })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  productId: string;

  @ApiPropertyOptional({ description: 'Optional variant SKU' })
  @IsOptional()
  @IsString()
  variantSku?: string;
}

export class MergeWishlistDto {
  @ApiProperty({ type: [GuestWishlistItemDto], description: 'Items from guest wishlist' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestWishlistItemDto)
  items: GuestWishlistItemDto[];
}
