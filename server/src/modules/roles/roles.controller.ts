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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { RoleQueryDto } from './dto/role-query.dto';

@ApiTags('Admin Roles')
@StaffOnly()
@Controller('admin/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles.view')
  @ApiOperation({ summary: 'List roles with member counts and filters' })
  async list(@Query() query: RoleQueryDto) {
    const data = await this.rolesService.list(query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('roles.create')
  @ApiOperation({ summary: 'Create a new administrative role' })
  async create(@Body() dto: CreateRoleDto, @Req() req: any) {
    const data = await this.rolesService.create(dto, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true, data, message: 'Role created successfully' };
  }

  @Get(':id')
  @RequirePermissions('roles.view')
  @ApiOperation({ summary: 'Get role details, permissions, and member counts' })
  async getById(@Param('id') id: string) {
    const data = await this.rolesService.getById(id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('roles.edit')
  @ApiOperation({ summary: 'Update role title, description, or status' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @Req() req: any) {
    const data = await this.rolesService.update(id, dto, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true, data, message: 'Role updated successfully' };
  }

  @Put(':id/permissions')
  @RequirePermissions('roles.assign')
  @ApiOperation({ summary: 'Assign permission keys to a role' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
    @Req() req: any,
  ) {
    const data = await this.rolesService.assignPermissions(id, dto.permissions, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return {
      success: true,
      data: data.role,
      diff: data.diff,
      message: `Permissions updated successfully (+${data.diff.added.length}, -${data.diff.removed.length})`,
    };
  }

  @Get(':id/users')
  @RequirePermissions('roles.view', 'users.view')
  @ApiOperation({ summary: 'List staff users assigned to this role' })
  async getRoleUsers(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.rolesService.getRoleUsers(id, Number(page) || 1, Number(limit) || 20);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('roles.delete')
  @ApiOperation({ summary: 'Delete a role if unused by active staff and invitations' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const result = await this.rolesService.delete(id, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}
