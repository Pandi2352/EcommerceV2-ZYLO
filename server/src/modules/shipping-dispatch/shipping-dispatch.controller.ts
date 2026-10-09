import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShippingDispatchService } from './shipping-dispatch.service';
import {
  CreateDispatchDto,
  GetRatesDto,
  SimulateWebhookDto,
} from './dto/create-dispatch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('admin/shipping-dispatch')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShippingDispatchController {
  constructor(private readonly dispatchService: ShippingDispatchService) {}

  @Get('metrics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getMetrics() {
    return this.dispatchService.getMetrics();
  }

  @Get('ready-to-ship')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getReadyToShipOrders() {
    return this.dispatchService.getReadyToShipOrders();
  }

  @Post('rates')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async calculateRates(@Body() dto: GetRatesDto) {
    return this.dispatchService.calculateRates(dto);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createDispatch(@Body() dto: CreateDispatchDto) {
    return this.dispatchService.createDispatch(dto);
  }

  @Get('manifests')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async findAllManifests(
    @Query('carrier') carrier?: string,
    @Query('status') status?: string,
  ) {
    return this.dispatchService.findAllManifests({ carrier, status });
  }

  @Get('manifests/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async findManifestById(@Param('id') id: string) {
    return this.dispatchService.findManifestById(id);
  }

  @Get('tracking/:trackingNumber')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.dispatchService.getTracking(trackingNumber);
  }

  @Post('simulate-webhook')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async simulateWebhook(@Body() dto: SimulateWebhookDto) {
    return this.dispatchService.simulateWebhook(dto);
  }

  @Get('webhooks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async findAllWebhooks() {
    return this.dispatchService.findAllWebhooks();
  }
}
