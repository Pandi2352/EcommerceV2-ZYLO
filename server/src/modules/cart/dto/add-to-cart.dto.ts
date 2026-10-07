import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: '66ef8...', description: 'Product MongoDB ID or slug' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiPropertyOptional({ example: 'IP15P-256-TI', description: 'Product Variant SKU if variant was selected' })
  @IsOptional()
  @IsString()
  variantSku?: string;

  @ApiProperty({ example: 1, minimum: 1, description: 'Quantity of items to add' })
  @IsInt()
  @Min(1)
  quantity: number;
}
