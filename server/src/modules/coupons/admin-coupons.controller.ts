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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';

@ApiTags('Admin Coupons')
@StaffOnly()
@Controller('admin/coupons')
export class AdminCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('stats')
  @RequirePermissions('coupons.view')
  @ApiOperation({ summary: 'Get coupon KPI metrics and redemption statistics' })
  async getStats() {
    return this.couponsService.getStats();
  }

  @Get()
  @RequirePermissions('coupons.view')
  @ApiOperation({ summary: 'List coupons with search, type filter, status filter, and pagination' })
  async list(@Query() query: QueryCouponDto) {
    return this.couponsService.findAll(query);
  }

  @Post()
  @RequirePermissions('coupons.create')
  @ApiOperation({ summary: 'Create a new promotional discount coupon' })
  async create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Get(':id')
  @RequirePermissions('coupons.view')
  @ApiOperation({ summary: 'Get coupon details by ID' })
  async findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('coupons.edit')
  @ApiOperation({ summary: 'Update coupon properties, limits, and rules' })
  async update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('coupons.edit')
  @ApiOperation({ summary: 'Toggle coupon active/inactive status' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive?: boolean,
  ) {
    return this.couponsService.toggleStatus(id, isActive);
  }

  @Delete(':id')
  @RequirePermissions('coupons.delete')
  @ApiOperation({ summary: 'Delete a promotional coupon' })
  async remove(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}
