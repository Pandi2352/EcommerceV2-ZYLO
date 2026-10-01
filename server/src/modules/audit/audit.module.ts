import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { LoginActivityController } from './login-activity.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AuditController, LoginActivityController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
