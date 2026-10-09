import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceiveDockShipmentDto } from './dto/dock-inspection.dto';
import { POStatus } from './schemas/purchase-order.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  // ==========================================
  // METRICS
  // ==========================================
  @Get('purchase-orders/metrics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getMetrics() {
    return this.poService.getMetrics();
  }

  // ==========================================
  // PURCHASE ORDERS
  // ==========================================
  @Get('purchase-orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async findAllPOs(
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.poService.findAllPOs({ status, supplierId });
  }

  @Get('purchase-orders/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async findPOById(@Param('id') id: string) {
    return this.poService.findPOById(id);
  }

  @Post('purchase-orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createPO(@Body() dto: CreatePurchaseOrderDto, @Request() req: any) {
    const creator = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ''}`.trim()
      : 'Admin';
    return this.poService.createPO(dto, creator);
  }

  @Patch('purchase-orders/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updatePOStatus(
    @Param('id') id: string,
    @Body('status') status: POStatus,
  ) {
    return this.poService.updatePOStatus(id, status);
  }

  // ==========================================
  // SUPPLIERS
  // ==========================================
  @Get('suppliers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async findAllSuppliers() {
    return this.poService.findAllSuppliers();
  }

  @Get('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async findSupplierById(@Param('id') id: string) {
    return this.poService.findSupplierById(id);
  }

  @Post('suppliers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createSupplier(@Body() dto: CreateSupplierDto) {
    return this.poService.createSupplier(dto);
  }

  @Put('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateSupplier(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.poService.updateSupplier(id, dto);
  }

  @Delete('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteSupplier(@Param('id') id: string) {
    return this.poService.deleteSupplier(id);
  }

  // ==========================================
  // RECEIVING DOCK
  // ==========================================
  @Post('receiving-dock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async receiveDockShipment(
    @Body() dto: ReceiveDockShipmentDto,
    @Request() req: any,
  ) {
    const inspector = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName || ''}`.trim()
      : 'Logistics Lead';
    return this.poService.receiveDockShipment(dto, inspector);
  }

  @Get('receiving-dock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async findAllDockReceipts() {
    return this.poService.findAllDockReceipts();
  }
}
