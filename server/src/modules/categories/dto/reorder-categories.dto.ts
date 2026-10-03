import { IsArray, ValidateNested, IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryOrderItemDto {
  @ApiProperty({ description: 'Category ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'New display order index' })
  @IsNumber()
  @Min(0)
  displayOrder: number;

  @ApiProperty({ description: 'New parent category ID or null for root', required: false })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}

export class ReorderCategoriesDto {
  @ApiProperty({ type: [CategoryOrderItemDto], description: 'List of categories with their updated orders and parents' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderItemDto)
  items: CategoryOrderItemDto[];
}
