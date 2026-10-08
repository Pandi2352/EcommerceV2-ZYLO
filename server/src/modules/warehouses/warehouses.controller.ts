import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { ReceiveStockTransferDto } from './dto/receive-stock-transfer.dto';
import { QueryWarehouseDto, QueryStockTransferDto } from './dto/query-warehouse.dto';
import { WarehouseStatus, TransferStatus } from './enums/warehouse.enums';

@ApiTags('Admin Warehouses & Fulfillment')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get('metrics')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Admin: Get warehouse & stock transfer aggregate metrics' })
  @ApiResponse({ status: 200, description: 'KPI metrics summary' })
  async getMetrics() {
    const metrics = await this.warehousesService.getWarehouseMetrics();
    return {
      success: true,
      code: 200,
      description: 'Warehouse metrics retrieved successfully',
      data: metrics,
    };
  }

  @Get()
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Admin: List all fulfillment centers & warehouses' })
  @ApiResponse({ status: 200, description: 'List of warehouses' })
  async getWarehouses(@Query() query: QueryWarehouseDto) {
    const data = await this.warehousesService.getWarehouses(query);
    return {
      success: true,
      code: 200,
      description: 'Warehouses retrieved successfully',
      data,
    };
  }

  @Get(':id')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Admin: Get single warehouse by ID' })
  @ApiResponse({ status: 200, description: 'Warehouse details' })
  async getWarehouseById(@Param('id') id: string) {
    const data = await this.warehousesService.getWarehouseById(id);
    return {
      success: true,
      code: 200,
      description: 'Warehouse retrieved successfully',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('products.create')
  @ApiOperation({ summary: 'Admin: Create a new fulfillment center' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully' })
  async createWarehouse(@Body() dto: CreateWarehouseDto) {
    const data = await this.warehousesService.createWarehouse(dto);
    return {
      success: true,
      code: 201,
      description: 'Fulfillment center created successfully',
      data,
    };
  }

  @Put(':id')
  @RequirePermissions('products.edit')
  @ApiOperation({ summary: 'Admin: Update an existing warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully' })
  async updateWarehouse(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    const data = await this.warehousesService.updateWarehouse(id, dto);
    return {
      success: true,
      code: 200,
      description: 'Warehouse updated successfully',
      data,
    };
  }

  @Patch(':id/status')
  @RequirePermissions('products.edit')
  @ApiOperation({ summary: 'Admin: Toggle warehouse active / maintenance status' })
  @ApiResponse({ status: 200, description: 'Warehouse status updated' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('status') status: WarehouseStatus,
  ) {
    const data = await this.warehousesService.toggleWarehouseStatus(id, status);
    return {
      success: true,
      code: 200,
      description: 'Warehouse status updated successfully',
      data,
    };
  }

  @Delete(':id')
  @RequirePermissions('products.delete')
  @ApiOperation({ summary: 'Admin: Soft delete a warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse deleted successfully' })
  async deleteWarehouse(@Param('id') id: string) {
    const data = await this.warehousesService.deleteWarehouse(id);
    return {
      success: true,
      code: 200,
      description: data.message,
    };
  }

  @Get(':id/inventory')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Admin: Get inventory levels for a specific warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse inventory items' })
  async getWarehouseInventory(@Param('id') id: string) {
    const data = await this.warehousesService.getWarehouseInventory(id);
    return {
      success: true,
      code: 200,
      description: 'Warehouse inventory items retrieved successfully',
      data,
    };
  }
}

@ApiTags('Admin Stock Transfers')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/stock-transfers')
export class StockTransfersController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Admin: List all inter-warehouse stock transfers' })
  @ApiResponse({ status: 200, description: 'List of stock transfers' })
  async getStockTransfers(@Query() query: QueryStockTransferDto) {
    const data = await this.warehousesService.getStockTransfers(query);
    return {
      success: true,
      code: 200,
      description: 'Stock transfers retrieved successfully',
      data,
    };
  }

  @Get(':id')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Admin: Get stock transfer manifest details by ID' })
  @ApiResponse({ status: 200, description: 'Stock transfer manifest' })
  async getStockTransferById(@Param('id') id: string) {
    const data = await this.warehousesService.getStockTransferById(id);
    return {
      success: true,
      code: 200,
      description: 'Stock transfer retrieved successfully',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('products.create')
  @ApiOperation({ summary: 'Admin: Create an inter-warehouse stock transfer manifest' })
  @ApiResponse({ status: 201, description: 'Stock transfer created successfully' })
  async createStockTransfer(
    @Body() dto: CreateStockTransferDto,
    @CurrentUser() user: UserDocument,
  ) {
    const data = await this.warehousesService.createStockTransfer(dto, user?.name || 'Admin');
    return {
      success: true,
      code: 201,
      description: 'Stock transfer manifest created successfully',
      data,
    };
  }

  @Patch(':id/status')
  @RequirePermissions('products.edit')
  @ApiOperation({ summary: 'Admin: Update stock transfer status (dispatch to IN_TRANSIT, cancel)' })
  @ApiResponse({ status: 200, description: 'Transfer status updated' })
  async updateTransferStatus(
    @Param('id') id: string,
    @Body('status') status: TransferStatus,
  ) {
    const data = await this.warehousesService.updateTransferStatus(id, status);
    return {
      success: true,
      code: 200,
      description: `Stock transfer status updated to ${status}`,
      data,
    };
  }

  @Post(':id/receive')
  @RequirePermissions('products.edit')
  @ApiOperation({ summary: 'Admin: Receive items at destination warehouse and complete transfer' })
  @ApiResponse({ status: 200, description: 'Stock received and inventory updated' })
  async receiveStockTransfer(
    @Param('id') id: string,
    @Body() dto: ReceiveStockTransferDto,
    @CurrentUser() user: UserDocument,
  ) {
    if (!dto.receivedBy) dto.receivedBy = user?.name || 'Admin';
    const data = await this.warehousesService.receiveStockTransfer(id, dto);
    return {
      success: true,
      code: 200,
      description: 'Stock transfer items successfully received into destination inventory',
      data,
    };
  }
}
