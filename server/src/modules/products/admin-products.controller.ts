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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { RequirePermissions } from '../../common/authorization/require-permissions.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductStatus } from './schemas/product.schema';

@ApiTags('Admin Products')
@StaffOnly()
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('metrics')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get product KPI metrics and stock status totals' })
  async getMetrics() {
    return this.productsService.getMetrics();
  }

  @Get('overview')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get product catalog overview metrics, distributions, and chart data' })
  async getOverview() {
    return this.productsService.getOverview();
  }

  @Get()
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'List all products with search, multi-facet filters, and pagination' })
  async list(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query, true);
  }

  @Post()
  @RequirePermissions('products.create')
  @ApiOperation({ summary: 'Create a new catalog product' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get(':id')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get full product details by ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions('products.edit')
  @ApiOperation({ summary: 'Update product details, pricing, variants, and specs' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('products.publish')
  @ApiOperation({ summary: 'Update product status (DRAFT, PUBLISHED, ARCHIVED)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: ProductStatus) {
    return this.productsService.updateStatus(id, status);
  }

  @Patch(':id/featured')
  @RequirePermissions('products.edit')
  @ApiOperation({ summary: 'Toggle product featured spotlight status' })
  async toggleFeatured(@Param('id') id: string) {
    return this.productsService.toggleFeatured(id);
  }

  @Delete(':id')
  @RequirePermissions('products.delete')
  @ApiOperation({ summary: 'Archive or permanently delete a product' })
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
