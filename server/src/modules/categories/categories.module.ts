import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoriesService } from './categories.service';
import { CategoriesSeedService } from './categories-seed.service';
import { AdminCategoriesController } from './admin-categories.controller';
import { PublicCategoriesController } from './public-categories.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
  ],
  controllers: [AdminCategoriesController, PublicCategoriesController],
  providers: [CategoriesService, CategoriesSeedService],
  exports: [CategoriesService, CategoriesSeedService, MongooseModule],
})
export class CategoriesModule {}
