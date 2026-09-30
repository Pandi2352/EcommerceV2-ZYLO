import { ApiProperty } from '@nestjs/swagger';
import { TokenDto } from './token.dto';
import { IsStrongPassword, PASSWORD_POLICY_MESSAGE } from '../../../common/validators/is-strong-password.decorator';

export class ResetPasswordDto extends TokenDto {
  @ApiProperty({ example: 'NewSecurePass123!', description: PASSWORD_POLICY_MESSAGE })
  @IsStrongPassword()
  password: string;
}
