import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class UpdateStaffRoleDto {
  @IsEnum(UserRole, { message: 'Invalid staff role specified' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;
}
