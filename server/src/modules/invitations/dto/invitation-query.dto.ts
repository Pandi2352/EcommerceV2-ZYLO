import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { InvitationStatus } from '../schemas/staff-invitation.schema';

export class InvitationQueryDto {
  @ApiPropertyOptional({ example: 'priya' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: InvitationStatus, example: InvitationStatus.INVITED })
  @IsOptional()
  @IsEnum(InvitationStatus)
  status?: InvitationStatus;

  @ApiPropertyOptional({ example: 'b3f54532-6e27-4632-9cb7-285d82054174' })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
