import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { AnalyticsService } from './analytics.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Admin Analytics')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @RequirePermissions('dashboard.view')
  @ApiOperation({
    summary: 'Get comprehensive admin dashboard metrics, sales charts, operational alerts, and activities',
  })
  async getDashboardSummary(@Query() query: DashboardQueryDto) {
    return this.analyticsService.getDashboardSummary(query);
  }
}
