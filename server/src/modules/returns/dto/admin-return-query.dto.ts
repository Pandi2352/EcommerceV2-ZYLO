import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AdminReturnQueryDto {
  @ApiPropertyOptional({ description: 'Search by return number, order number, customer name, or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by return workflow status',
    enum: ['ALL', 'REQUESTED', 'APPROVED', 'REJECTED', 'REFUNDED'],
    default: 'ALL',
  })
  @IsOptional()
  @IsIn(['ALL', 'REQUESTED', 'APPROVED', 'REJECTED', 'REFUNDED'])
  status?: 'ALL' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED' = 'ALL';

  @ApiPropertyOptional({
    description: 'Sort criteria',
    enum: ['newest', 'recent', 'oldest', 'amount_desc', 'amount_asc'],
    default: 'newest',
  })
  @IsOptional()
  @IsIn(['newest', 'recent', 'oldest', 'amount_desc', 'amount_asc'])
  sortBy?: 'newest' | 'recent' | 'oldest' | 'amount_desc' | 'amount_asc' = 'newest';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
