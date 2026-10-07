import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { ProductsService } from './products.service';
import { AdminInventoryQueryDto } from './dto/admin-inventory-query.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@ApiTags('Admin Inventory')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('summary')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get store-wide inventory KPIs, stock unit totals, and valuation' })
  async getSummary() {
    return this.productsService.getInventorySummary();
  }

  @Get()
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'List and filter catalog product inventory levels with variant breakdown' })
  async listInventory(@Query() query: AdminInventoryQueryDto) {
    return this.productsService.getInventoryList(query);
  }

  @Patch(':id/adjust')
  @RequirePermissions('products.edit')
  @ApiOperation({ summary: 'Manually adjust, increment, or set stock quantity and thresholds' })
  async adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.productsService.adjustInventoryStock(id, dto);
  }
}
