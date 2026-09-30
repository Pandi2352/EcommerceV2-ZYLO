import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Alex Mercer',
    description: 'Full display name of the customer',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({
    example: 'alex.mercer@example.com',
    description: 'Unique valid email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Strong password (minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#_)',
    }
  )
  password: string;
}
