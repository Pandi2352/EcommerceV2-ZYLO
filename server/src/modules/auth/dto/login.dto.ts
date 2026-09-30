import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'alex.mercer@example.com',
    description: 'Registered account email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Account password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: true,
    required: false,
    default: false,
    description: 'When true, extends refresh token cookie duration to 30 days',
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
