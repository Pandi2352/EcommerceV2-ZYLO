import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffInvitation, StaffInvitationSchema } from './schemas/staff-invitation.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { MailModule } from '../mail/mail.module';
import { AuditModule } from '../audit/audit.module';
import { InvitationsService } from './invitations.service';
import { UserCodeService } from './user-code.service';
import { InvitationAcceptanceService } from './invitation-acceptance.service';
import { InvitationsController } from './invitations.controller';
import { PublicInvitationsController } from './public-invitations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffInvitation.name, schema: StaffInvitationSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    MailModule,
    AuditModule,
  ],
  controllers: [InvitationsController, PublicInvitationsController],
  providers: [InvitationsService, UserCodeService, InvitationAcceptanceService],
  exports: [InvitationsService, InvitationAcceptanceService, MongooseModule],
})
export class InvitationsModule {}
