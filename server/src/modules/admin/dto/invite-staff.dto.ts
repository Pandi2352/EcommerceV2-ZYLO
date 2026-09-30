import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class InviteStaffDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(UserRole, { message: 'Invalid staff role specified' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customPermissions?: string[];
}
