import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export const OVERVIEW_PERIODS = [7, 30, 90] as const;
export type OverviewPeriod = (typeof OVERVIEW_PERIODS)[number];

export class OverviewQueryDto {
  @ApiPropertyOptional({ enum: OVERVIEW_PERIODS, default: 30, description: 'Days covered by time-based figures' })
  @IsOptional()
  @Type(() => Number)
  @IsIn(OVERVIEW_PERIODS)
  days: OverviewPeriod = 30;
}
