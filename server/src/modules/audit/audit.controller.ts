import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuditService } from './audit.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@Roles(UserRole.ADMIN)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List security audit events (logins, password and MFA changes)' })
  @ApiResponse({ status: 200, description: 'Paginated audit events, newest first' })
  @ApiResponse({ status: 403, description: 'Requires ADMIN or SUPER_ADMIN role' })
  list(@Query() query: AuditLogQueryDto) {
    return this.auditService.list(query);
  }
}
