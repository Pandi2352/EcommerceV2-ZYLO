import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { IsStrongPassword, PASSWORD_POLICY_MESSAGE } from '../../../common/validators/is-strong-password.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'Alex Mercer', description: 'Full display name of the customer' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'alex.mercer@example.com', description: 'Unique valid email address' })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: PASSWORD_POLICY_MESSAGE })
  @IsStrongPassword()
  password: string;
}
