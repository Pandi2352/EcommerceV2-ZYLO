import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/query-product.dto';

@ApiTags('Public Products')
@Public()
@Controller('products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Browse published store products with category, brand, and price filters' })
  async list(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query, false);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get spotlight featured products for homepage' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.productsService.findAll({ isFeatured: true, limit: limit || 8 }, false);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get single published product by URL slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
