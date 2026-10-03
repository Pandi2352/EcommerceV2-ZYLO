import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Public()
@Controller('categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('tree')
  @ApiOperation({ summary: 'Get active category tree for storefront navigation mega-menu' })
  async getPublicTree() {
    return this.categoriesService.getTree('ACTIVE');
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category details by URL slug for storefront category page' })
  async getBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
