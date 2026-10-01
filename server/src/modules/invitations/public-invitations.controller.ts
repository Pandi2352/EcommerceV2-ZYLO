import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { InvitationAcceptanceService } from './invitation-acceptance.service';
import { VerifyInvitationDto } from './dto/verify-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@ApiTags('Public Invitations')
@Public()
@Controller('invitations')
export class PublicInvitationsController {
  constructor(private readonly acceptanceService: InvitationAcceptanceService) {}

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Verify an invitation token and fetch masked recipient details' })
  async verify(@Body() dto: VerifyInvitationDto) {
    return this.acceptanceService.verify(dto.token);
  }

  @Post('accept')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Accept an invitation and set password to create a staff account' })
  async accept(@Body() dto: AcceptInvitationDto, @Req() req: any) {
    return this.acceptanceService.accept(dto.token, dto.password, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
