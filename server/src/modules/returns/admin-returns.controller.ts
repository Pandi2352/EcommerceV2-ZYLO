import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ReturnsService } from './returns.service';
import { AdminReturnQueryDto } from './dto/admin-return-query.dto';
import { ReviewReturnDto } from './dto/review-return.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';

@ApiTags('Admin Returns')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/returns')
export class AdminReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get('summary')
  @RequirePermissions('returns.view')
  @ApiOperation({ summary: 'Admin: Get return metrics and count breakdown' })
  @ApiResponse({ status: 200, description: 'Return metrics overview' })
  async getSummary() {
    return this.returnsService.getAdminSummary();
  }

  @Get()
  @RequirePermissions('returns.view')
  @ApiOperation({ summary: 'Admin: List all customer return requests with filtering & pagination' })
  @ApiResponse({ status: 200, description: 'Paginated returns list' })
  async listReturns(@Query() query: AdminReturnQueryDto) {
    return this.returnsService.getAdminReturns(query);
  }

  @Get(':id')
  @RequirePermissions('returns.view')
  @ApiOperation({ summary: 'Admin: Get full details of a specific return request' })
  @ApiResponse({ status: 200, description: 'Return request details with order data' })
  async getReturnById(@Param('id') id: string) {
    return this.returnsService.getAdminReturnById(id);
  }

  @Patch(':id/review')
  @RequirePermissions('returns.approve')
  @ApiOperation({ summary: 'Admin: Approve or Reject a return request with restock options' })
  @ApiResponse({ status: 200, description: 'Return reviewed successfully' })
  async reviewReturn(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: ReviewReturnDto,
  ) {
    const staffName = user.name || user.email || 'Admin Staff';
    const returnReq = await this.returnsService.reviewReturn(id, staffName, dto);
    return {
      returnRequest: returnReq,
      message: `Return request ${dto.decision === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
    };
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('returns.approve')
  @ApiOperation({ summary: 'Admin: Process online or manual refund for an approved return' })
  @ApiResponse({ status: 200, description: 'Refund triggered successfully' })
  async processRefund(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: ProcessRefundDto,
  ) {
    const staffName = user.name || user.email || 'Admin Staff';
    const returnReq = await this.returnsService.processRefund(id, staffName, dto);
    return {
      returnRequest: returnReq,
      message: 'Refund recorded and processed successfully',
    };
  }
}
