import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequireAnyPermission } from '../../common/authorization/require-permissions.decorator';
import { AuditService } from './audit.service';
import { LoginActivityQueryDto } from './dto/login-activity-query.dto';

@ApiTags('Admin Login Activity')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/login-activity')
export class LoginActivityController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequireAnyPermission('audit_logs.view', 'users.view')
  @ApiOperation({ summary: 'List admin login activity, client devices, and authentication metrics' })
  async getLoginActivity(@Query() query: LoginActivityQueryDto) {
    return this.auditService.getLoginActivity(query);
  }
}
