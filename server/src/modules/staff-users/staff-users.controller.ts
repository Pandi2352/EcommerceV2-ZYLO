import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { StaffUsersService } from './staff-users.service';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { StaffUserQueryDto } from './dto/staff-user-query.dto';

@ApiTags('Admin Staff Users')
@StaffOnly()
@Controller('admin/users')
export class StaffUsersController {
  constructor(private readonly staffUsersService: StaffUsersService) {}

  @Get()
  @RequirePermissions('users.view')
  @ApiOperation({ summary: 'List staff users with filtering, sorting, and stats' })
  async list(@Query() query: StaffUserQueryDto) {
    return this.staffUsersService.list(query);
  }

  @Get(':id')
  @RequirePermissions('users.view')
  @ApiOperation({ summary: 'Get staff user details, permissions, and recent activity' })
  async getById(@Param('id') id: string) {
    return this.staffUsersService.getById(id);
  }

  @Patch(':id')
  @RequirePermissions('users.edit')
  @ApiOperation({ summary: 'Update staff user profile information' })
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateStaffUserDto,
    @Req() req: any,
  ) {
    return this.staffUsersService.updateProfile(id, dto, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Put(':id/roles')
  @RequirePermissions('roles.assign')
  @ApiOperation({ summary: 'Assign roles to staff user' })
  async assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
    @Req() req: any,
  ) {
    return this.staffUsersService.assignRoles(id, dto.roleIds, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post(':id/activate')
  @RequirePermissions('users.activate')
  @ApiOperation({ summary: 'Reactivate suspended staff member' })
  async activate(@Param('id') id: string, @Req() req: any) {
    return this.staffUsersService.activate(id, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post(':id/deactivate')
  @RequirePermissions('users.activate')
  @ApiOperation({ summary: 'Suspend staff member and terminate active sessions' })
  async deactivate(@Param('id') id: string, @Req() req: any) {
    return this.staffUsersService.deactivate(id, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post(':id/reset-password')
  @RequirePermissions('users.edit')
  @ApiOperation({ summary: 'Trigger password reset email for staff member' })
  async resetPassword(@Param('id') id: string, @Req() req: any) {
    return this.staffUsersService.resetPassword(id, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post(':id/revoke-sessions')
  @RequirePermissions('users.edit')
  @ApiOperation({ summary: 'Revoke all active sessions for staff member' })
  async revokeSessions(@Param('id') id: string, @Req() req: any) {
    return this.staffUsersService.revokeSessions(id, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Soft-delete staff member and revoke all active sessions' })
  async softDelete(@Param('id') id: string, @Req() req: any) {
    return this.staffUsersService.softDelete(id, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
