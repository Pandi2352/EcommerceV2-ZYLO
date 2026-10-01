import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { StaffInvitation, StaffInvitationSchema } from '../invitations/schemas/staff-invitation.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuditModule } from '../audit/audit.module';
import { RolesService } from './roles.service';
import { RolesSeedService } from './roles-seed.service';
import { RolesController } from './roles.controller';
import { PermissionResolverService } from '../../common/authorization/permission-resolver.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: StaffInvitation.name, schema: StaffInvitationSchema },
    ]),
    PermissionsModule,
    AuditModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, RolesSeedService, PermissionResolverService],
  exports: [RolesService, RolesSeedService, PermissionResolverService, MongooseModule],
})
export class RolesModule {}
