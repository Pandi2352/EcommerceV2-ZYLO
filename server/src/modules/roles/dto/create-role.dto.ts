import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Marketing Associate', description: 'Display name of the role' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @ApiPropertyOptional({ example: 'marketing_associate', description: 'Unique identifier key' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z][a-z0-9_]{2,49}$/, {
    message: 'Role key must start with a lowercase letter and contain 3-50 lowercase alphanumeric or underscore characters',
  })
  key?: string;

  @ApiPropertyOptional({ example: 'Manages marketing coupons and campaigns', description: 'Brief summary of role responsibilities' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiPropertyOptional({ example: ['coupons.view', 'coupons.create'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ example: 'b3f54532-6e27-4632-9cb7-285d82054174', description: 'Optional role id to copy initial permissions from' })
  @IsOptional()
  @IsString()
  copyFromRoleId?: string;
}
