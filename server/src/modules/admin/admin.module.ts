import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { AuditModule } from '../audit/audit.module';
import {
  StaffInvitation,
  StaffInvitationSchema,
} from './schemas/staff-invitation.schema';
import { StaffService } from './services/staff.service';
import { StaffController } from './controllers/staff.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffInvitation.name, schema: StaffInvitationSchema },
    ]),
    UsersModule,
    AuthModule,
    MailModule,
    AuditModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class AdminModule {}
