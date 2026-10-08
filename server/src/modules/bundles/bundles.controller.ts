import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { BundlesService } from './bundles.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { QueryBundleDto } from './dto/query-bundle.dto';
import { Public } from '../../common/decorators/public.decorator';
import { StaffOnly } from '../../common/authorization/account-type.decorator';

@ApiTags('Product Bundles (Public)')
@Public()
@Controller('bundles')
export class PublicBundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Get('product/:idOrSlug')
  @ApiOperation({ summary: 'Get active bundles and Frequently Bought Together kits for a product' })
  async getBundlesForProduct(@Param('idOrSlug') idOrSlug: string) {
    return this.bundlesService.getBundlesForProduct(idOrSlug);
  }
}

@ApiTags('Product Bundles (Admin)')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@StaffOnly()
@Controller('admin/bundles')
export class AdminBundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get KPI metrics for product bundles' })
  async getMetrics() {
    return this.bundlesService.getMetrics();
  }

  @Get()
  @ApiOperation({ summary: 'List all product bundles with pagination and filters' })
  async findAll(@Query() query: QueryBundleDto) {
    return this.bundlesService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bundle details by ID' })
  async findById(@Param('id') id: string) {
    return this.bundlesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product bundle kit' })
  async create(@Body() dto: CreateBundleDto) {
    return this.bundlesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing product bundle' })
  async update(@Param('id') id: string, @Body() dto: UpdateBundleDto) {
    return this.bundlesService.update(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle bundle active/inactive status' })
  async toggleActive(@Param('id') id: string) {
    return this.bundlesService.toggleActive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product bundle' })
  async delete(@Param('id') id: string) {
    return this.bundlesService.delete(id);
  }
}
