import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { UsersService } from './users.service';
import { AdminCustomerQueryDto } from './dto/admin-customer-query.dto';

@ApiTags('Admin Customers')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('stats')
  @RequirePermissions('customers.view')
  @ApiOperation({ summary: 'Get customer KPI metrics, total counts, and lifetime value' })
  async getStats() {
    return this.usersService.getCustomerStatsAdmin();
  }

  @Get('export')
  @RequirePermissions('customers.export')
  @ApiOperation({ summary: 'Export customers directory to CSV or JSON format' })
  async exportCustomers(
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Res() res: Response,
  ) {
    const { data, filename, contentType } = await this.usersService.exportCustomersAdmin(format);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(data);
  }

  @Get()
  @RequirePermissions('customers.view')
  @ApiOperation({ summary: 'List customer directory with search, spend, orders, and pagination' })
  async list(@Query() query: AdminCustomerQueryDto) {
    return this.usersService.findCustomersAdmin(query);
  }

  @Get(':id')
  @RequirePermissions('customers.view')
  @ApiOperation({ summary: 'Get full customer profile, lifetime value metrics, and order history' })
  async getDetails(@Param('id') id: string) {
    return this.usersService.getCustomerDetailsAdmin(id);
  }

  @Patch(':id/status')
  @RequirePermissions('customers.activate')
  @ApiOperation({ summary: 'Toggle customer account active or suspended status' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive?: boolean,
  ) {
    return this.usersService.toggleCustomerStatusAdmin(id, isActive);
  }
}
