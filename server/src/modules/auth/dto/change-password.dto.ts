import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsStrongPassword, PASSWORD_POLICY_MESSAGE } from '../../../common/validators/is-strong-password.decorator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPass123!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  currentPassword: string;

  @ApiProperty({ example: 'NewSecurePass123!', description: PASSWORD_POLICY_MESSAGE })
  @IsStrongPassword()
  newPassword: string;
}
