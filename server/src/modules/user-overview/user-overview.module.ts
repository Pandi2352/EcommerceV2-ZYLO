import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { StaffInvitation, StaffInvitationSchema } from '../invitations/schemas/staff-invitation.schema';
import { AuditLog, AuditLogSchema } from '../audit/schemas/audit-log.schema';
import { RolesModule } from '../roles/roles.module';
import { UserOverviewController } from './user-overview.controller';
import { UserOverviewService } from './user-overview.service';
import { SignInStatsService } from './sign-in-stats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: StaffInvitation.name, schema: StaffInvitationSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    // PermissionsGuard dependencies (permission resolver) come from RolesModule
    RolesModule,
  ],
  controllers: [UserOverviewController],
  providers: [UserOverviewService, SignInStatsService],
})
export class UserOverviewModule {}
