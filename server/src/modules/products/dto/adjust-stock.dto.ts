import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({
    description: 'Type of stock adjustment',
    enum: ['SET', 'INCREMENT', 'DECREMENT'],
  })
  @IsIn(['SET', 'INCREMENT', 'DECREMENT'])
  type: 'SET' | 'INCREMENT' | 'DECREMENT';

  @ApiProperty({
    description: 'Stock quantity value to set or delta amount',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Optional SKU of specific product variant to adjust',
  })
  @IsOptional()
  @IsString()
  variantSku?: string;

  @ApiPropertyOptional({
    description: 'Update the low stock alert threshold',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({
    description: 'Toggle whether inventory is tracked for this item',
  })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @ApiPropertyOptional({
    description: 'Toggle whether backorders are allowed when stock is 0',
  })
  @IsOptional()
  @IsBoolean()
  allowBackorders?: boolean;

  @ApiPropertyOptional({
    description: 'Audit note or justification for the adjustment',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
