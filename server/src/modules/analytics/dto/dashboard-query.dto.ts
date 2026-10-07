import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Timeframe range for metrics and chart',
    enum: ['7d', '14d', '30d', '90d', 'year', 'all'],
    default: '30d',
  })
  @IsOptional()
  @IsIn(['7d', '14d', '30d', '90d', 'year', 'all'])
  range?: '7d' | '14d' | '30d' | '90d' | 'year' | 'all' = '30d';
}
