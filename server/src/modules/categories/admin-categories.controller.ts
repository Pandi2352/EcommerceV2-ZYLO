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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

@ApiTags('Admin Categories')
@StaffOnly()
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('overview')
  @RequirePermissions('categories.view')
  @ApiOperation({ summary: 'Get category overview metrics, distributions, and chart data' })
  async getOverview() {
    return this.categoriesService.getOverview();
  }

  @Get('stats')
  @RequirePermissions('categories.view')
  @ApiOperation({ summary: 'Get category KPI metrics and counts' })
  async getStats() {
    return this.categoriesService.getStats();
  }

  @Get('tree')
  @RequirePermissions('categories.view')
  @ApiOperation({ summary: 'Get complete hierarchical category tree (all statuses)' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'ALL'] })
  async getTree(@Query('status') status?: 'ACTIVE' | 'INACTIVE' | 'ALL') {
    return this.categoriesService.getTree(status || 'ALL');
  }

  @Get()
  @RequirePermissions('categories.view')
  @ApiOperation({ summary: 'List categories with pagination, search, and hierarchy filtering' })
  async list(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @Post()
  @RequirePermissions('categories.create')
  @ApiOperation({ summary: 'Create a new catalog category' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch('reorder')
  @RequirePermissions('categories.edit')
  @ApiOperation({ summary: 'Bulk reorder category display orders and tree positions' })
  async reorder(@Body() dto: ReorderCategoriesDto) {
    return this.categoriesService.reorder(dto);
  }

  @Get(':id')
  @RequirePermissions('categories.view')
  @ApiOperation({ summary: 'Get category by ID' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('categories.edit')
  @ApiOperation({ summary: 'Update category details and taxonomy' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('categories.edit')
  @ApiOperation({ summary: 'Toggle category status between ACTIVE and INACTIVE' })
  async toggleStatus(@Param('id') id: string) {
    return this.categoriesService.toggleStatus(id);
  }

  @Delete(':id')
  @RequirePermissions('categories.delete')
  @ApiOperation({ summary: 'Safely delete a category with optional subcategory reassignment' })
  @ApiQuery({
    name: 'reassignToId',
    required: false,
    description: 'Target category ID to reassign children to, or "root" to make them root-level',
  })
  async remove(
    @Param('id') id: string,
    @Query('reassignToId') reassignToId?: string,
  ) {
    return this.categoriesService.remove(id, reassignToId);
  }
}
