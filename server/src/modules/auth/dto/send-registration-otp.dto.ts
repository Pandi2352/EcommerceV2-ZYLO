import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class SendRegistrationOtpDto {
  @ApiProperty({ example: 'customer@example.com', description: 'Email address to send OTP verification code to' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;
}
