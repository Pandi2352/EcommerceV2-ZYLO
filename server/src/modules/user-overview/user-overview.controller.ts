import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { UserOverviewService } from './user-overview.service';
import { OverviewQueryDto } from './dto/overview-query.dto';

@ApiTags('Admin Staff Users')
@StaffOnly()
@Controller('admin/user-management')
export class UserOverviewController {
  constructor(private readonly overview: UserOverviewService) {}

  @Get('overview')
  @RequirePermissions('users.view')
  @ApiOperation({ summary: 'Counts and trends for the User management overview page' })
  @ApiResponse({ status: 200, description: 'Users, roles, invitations, admin sign-ins per day, and items needing attention' })
  getOverview(@Query() query: OverviewQueryDto) {
    return this.overview.getOverview(query.days);
  }
}
