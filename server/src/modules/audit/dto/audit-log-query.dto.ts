import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { AuditEvent } from '../audit-event.enum';

export class AuditLogQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AuditEvent })
  @IsOptional()
  @IsEnum(AuditEvent)
  event?: AuditEvent;

  @ApiPropertyOptional({ example: 'admin@zylo.internal' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: ['customer', 'admin'] })
  @IsOptional()
  @IsIn(['customer', 'admin'])
  portal?: string;
}
