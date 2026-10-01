import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationQueryDto } from './dto/invitation-query.dto';

@ApiTags('Admin Invitations')
@StaffOnly()
@Controller('admin/invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  @RequirePermissions('users.view')
  @ApiOperation({ summary: 'List staff invitations with status filters' })
  async list(@Query() query: InvitationQueryDto) {
    return this.invitationsService.list(query);
  }

  @Post()
  @RequirePermissions('users.invite')
  @ApiOperation({ summary: 'Create and send a staff invitation email' })
  async create(@Body() dto: CreateInvitationDto, @Req() req: any) {
    return this.invitationsService.create(dto, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post(':id/resend')
  @RequirePermissions('users.invite')
  @ApiOperation({ summary: 'Rotate token and resend invitation email' })
  async resend(@Param('id') id: string, @Req() req: any) {
    return this.invitationsService.resend(id, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post(':id/revoke')
  @RequirePermissions('users.invite')
  @ApiOperation({ summary: 'Revoke an active invitation' })
  async revoke(@Param('id') id: string, @Req() req: any) {
    return this.invitationsService.revoke(id, req.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
