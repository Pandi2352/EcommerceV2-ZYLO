import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AbandonedCartsService, type AbandonedCartQueryDto } from './abandoned-carts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller()
export class AbandonedCartsController {
  constructor(private readonly abandonedCartsService: AbandonedCartsService) {}

  /**
   * Public: Restore abandoned cart using token from email link.
   */
  @Public()
  @Get('abandoned-carts/restore/:token')
  async restoreCart(@Param('token') token: string) {
    return this.abandonedCartsService.restoreCartByToken(token);
  }

  /**
   * Admin: Aggregated KPI metrics for Abandoned Carts recovery dashboard.
   */
  @Get('admin/abandoned-carts/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getMetrics() {
    return this.abandonedCartsService.getMetrics();
  }

  /**
   * Admin: List abandoned carts with filters, search, and pagination.
   */
  @Get('admin/abandoned-carts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll(@Query() query: AbandonedCartQueryDto) {
    return this.abandonedCartsService.findAllAdmin(query);
  }

  /**
   * Admin: Manually trigger the background recovery evaluation job immediately.
   */
  @Post('admin/abandoned-carts/trigger-job')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async triggerJob() {
    return this.abandonedCartsService.runManualJob();
  }

  /**
   * Admin: Send immediate recovery email for a single cart.
   */
  @Post('admin/abandoned-carts/:id/send-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async sendEmail(@Param('id') id: string) {
    return this.abandonedCartsService.sendManualEmail(id);
  }

  /**
   * Admin: Manually mark an abandoned cart as recovered.
   */
  @Patch('admin/abandoned-carts/:id/mark-recovered')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async markRecovered(@Param('id') id: string) {
    return this.abandonedCartsService.markManuallyRecovered(id);
  }
}
