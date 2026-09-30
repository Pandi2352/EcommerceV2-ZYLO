import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'customer@zylo.internal', description: 'Registered account email address' })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'CustomerPassword123!', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional({
    example: true,
    default: false,
    description: 'When true, the session lasts JWT_REFRESH_REMEMBER_EXPIRY (default 30 days)',
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
