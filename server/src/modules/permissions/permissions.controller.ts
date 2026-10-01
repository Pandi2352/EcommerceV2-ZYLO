import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { PermissionsService, GroupedPermissionResponse } from './permissions.service';

@ApiTags('Admin Permissions')
@StaffOnly()
@Controller('admin/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('roles.view')
  @ApiOperation({ summary: 'List permission catalog grouped by domain and module' })
  @ApiResponse({ status: 200, description: 'Active permission catalog' })
  async list(): Promise<{ success: boolean; data: GroupedPermissionResponse[] }> {
    const data = await this.permissionsService.getGroupedPermissions();
    return { success: true, data };
  }
}
