import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { BrandsService } from './brands.service';

@ApiTags('Brands')
@Public()
@Controller('brands')
export class PublicBrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active brands for storefront listing and brand showcase' })
  async getPublicBrands() {
    return this.brandsService.getPublicBrands();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured brands for storefront homepage carousel' })
  async getFeaturedBrands() {
    return this.brandsService.getFeaturedBrands();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get brand details by URL slug for storefront brand collection page' })
  async getBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }
}
