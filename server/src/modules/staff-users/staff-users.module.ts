import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { AuditLog, AuditLogSchema } from '../audit/schemas/audit-log.schema';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { StaffUsersService } from './staff-users.service';
import { StaffUsersController } from './staff-users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    RolesModule,
    AuthModule,
    AuditModule,
  ],
  controllers: [StaffUsersController],
  providers: [StaffUsersService],
  exports: [StaffUsersService, MongooseModule],
})
export class StaffUsersModule {}
