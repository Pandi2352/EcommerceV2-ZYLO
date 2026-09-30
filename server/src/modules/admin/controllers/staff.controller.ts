import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ReqMeta, RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { UserDocument } from '../../users/schemas/user.schema';
import { StaffService, StaffListQuery } from '../services/staff.service';
import { InviteStaffDto } from '../dto/invite-staff.dto';
import { UpdateStaffRoleDto } from '../dto/update-staff-role.dto';
import { UpdateStaffPermissionsDto } from '../dto/update-staff-permissions.dto';
import { UpdateStaffStatusDto } from '../dto/update-staff-status.dto';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';

@ApiTags('Admin Staff & User Management')
@Controller('admin/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List staff administrators with filtering and summary stats' })
  async listStaff(@Query() query: StaffListQuery) {
    return this.staffService.listStaff(query);
  }

  @Patch('users/:id/role')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a staff member role (Super Admin only)' })
  async updateRole(
    @Param('id') targetId: string,
    @Body() dto: UpdateStaffRoleDto,
    @CurrentUser() adminUser: UserDocument,
    @ReqMeta() meta: RequestMeta,
  ) {
    return this.staffService.updateRole(targetId, dto.role, adminUser, meta);
  }

  @Patch('users/:id/permissions')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update custom permissions override for a staff member' })
  async updatePermissions(
    @Param('id') targetId: string,
    @Body() dto: UpdateStaffPermissionsDto,
    @CurrentUser() adminUser: UserDocument,
    @ReqMeta() meta: RequestMeta,
  ) {
    return this.staffService.updatePermissions(targetId, dto.permissions, adminUser, meta);
  }

  @Patch('users/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate or suspend a staff administrator account' })
  async updateStatus(
    @Param('id') targetId: string,
    @Body() dto: UpdateStaffStatusDto,
    @CurrentUser() adminUser: UserDocument,
    @ReqMeta() meta: RequestMeta,
  ) {
    return this.staffService.updateStatus(targetId, dto.isActive, adminUser, meta);
  }

  @Post('invitations')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send an email invitation to a new staff member' })
  async inviteStaff(
    @Body() dto: InviteStaffDto,
    @CurrentUser() adminUser: UserDocument,
    @ReqMeta() meta: RequestMeta,
  ) {
    return this.staffService.inviteStaff(dto, adminUser, meta);
  }

  @Get('invitations')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all staff invitations' })
  async listInvitations() {
    return this.staffService.listInvitations();
  }

  @Post('invitations/:id/resend')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend an active staff invitation email' })
  async resendInvitation(
    @Param('id') id: string,
    @CurrentUser() adminUser: UserDocument,
    @ReqMeta() meta: RequestMeta,
  ) {
    return this.staffService.resendInvitation(id, adminUser, meta);
  }

  @Delete('invitations/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a pending staff invitation' })
  async revokeInvitation(
    @Param('id') id: string,
    @CurrentUser() adminUser: UserDocument,
    @ReqMeta() meta: RequestMeta,
  ) {
    return this.staffService.revokeInvitation(id, adminUser, meta);
  }

  @Public()
  @Get('invite/:token')
  @ApiOperation({ summary: 'Validate an invitation link token (Public)' })
  async validateToken(@Param('token') token: string) {
    return this.staffService.validateInviteToken(token);
  }

  @Public()
  @Post('accept-invite')
  @ApiOperation({ summary: 'Accept invitation and set account password (Public)' })
  async acceptInvite(
    @Body() dto: AcceptInvitationDto,
    @ReqMeta() meta: RequestMeta,
  ) {
    return this.staffService.acceptInvitation(dto, meta);
  }
}
