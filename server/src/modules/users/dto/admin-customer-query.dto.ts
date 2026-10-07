import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminCustomerQueryDto {
  @ApiPropertyOptional({ example: 'john', description: 'Search customer name, email, or phone' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['ALL', 'ACTIVE', 'SUSPENDED'], description: 'Filter by account status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    enum: ['recent', 'spend', 'orders', 'name'],
    description: 'Sort order criteria',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'recent' | 'spend' | 'orders' | 'name' = 'recent';

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
