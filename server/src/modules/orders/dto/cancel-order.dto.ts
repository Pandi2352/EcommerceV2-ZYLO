import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiPropertyOptional({ description: 'Reason for cancellation', example: 'Found a better price' })
  @IsOptional()
  @IsString()
  reason?: string;
}
