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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';

@ApiTags('Admin Brands')
@StaffOnly()
@Controller('admin/brands')
export class AdminBrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get('stats')
  @RequirePermissions('brands.view')
  @ApiOperation({ summary: 'Get brand KPI metrics, totals, and country representation' })
  async getStats() {
    return this.brandsService.getStats();
  }

  @Get()
  @RequirePermissions('brands.view')
  @ApiOperation({ summary: 'List brands with pagination, search, status, and country filtering' })
  async list(@Query() query: QueryBrandDto) {
    return this.brandsService.findAll(query);
  }

  @Post()
  @RequirePermissions('brands.create')
  @ApiOperation({ summary: 'Create a new brand partner' })
  async create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @Get(':id')
  @RequirePermissions('brands.view')
  @ApiOperation({ summary: 'Get brand by ID' })
  async findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('brands.edit')
  @ApiOperation({ summary: 'Update brand details, profile, or SEO' })
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('brands.edit')
  @ApiOperation({ summary: 'Toggle brand status between ACTIVE and INACTIVE' })
  async toggleStatus(@Param('id') id: string) {
    return this.brandsService.toggleStatus(id);
  }

  @Patch(':id/featured')
  @RequirePermissions('brands.edit')
  @ApiOperation({ summary: 'Toggle brand featured spotlight flag' })
  async toggleFeatured(@Param('id') id: string) {
    return this.brandsService.toggleFeatured(id);
  }

  @Delete(':id')
  @RequirePermissions('brands.delete')
  @ApiOperation({ summary: 'Delete a brand partner' })
  async remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
