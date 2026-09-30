import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { MfaCodeDto } from './mfa-code.dto';

export class DisableMfaDto extends MfaCodeDto {
  @ApiPropertyOptional({ description: 'Current password (required when the account has one)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  password?: string;
}
