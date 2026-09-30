import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsStrongPassword } from '../../../common/validators/is-strong-password.decorator';

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty({ message: 'Invitation token is required' })
  token: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(120, { message: 'Name cannot exceed 120 characters' })
  name: string;

  @IsStrongPassword()
  password: string;
}
