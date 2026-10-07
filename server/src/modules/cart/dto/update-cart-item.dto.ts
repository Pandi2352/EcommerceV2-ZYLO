import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiPropertyOptional({ example: 2, minimum: 1, description: 'Updated item quantity' })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: true, description: 'Whether item is selected for checkout (Amazon feature)' })
  @IsOptional()
  @IsBoolean()
  selected?: boolean;
}
