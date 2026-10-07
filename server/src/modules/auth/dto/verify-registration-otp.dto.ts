import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { IsStrongPassword, PASSWORD_POLICY_MESSAGE } from '../../../common/validators/is-strong-password.decorator';

export class VerifyRegistrationOtpDto {
  @ApiProperty({ example: 'customer@example.com', description: 'Customer email address' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP received via email' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @ApiProperty({ example: 'Alex Mercer', description: 'Customer display name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'SecurePass123!', description: PASSWORD_POLICY_MESSAGE })
  @IsStrongPassword()
  password: string;
}
