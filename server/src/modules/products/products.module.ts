import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { Brand, BrandSchema } from '../brands/schemas/brand.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { ProductsService } from './products.service';
import { ProductsSeedService } from './products-seed.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminInventoryController } from './admin-inventory.controller';
import { PublicProductsController } from './public-products.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [AdminProductsController, AdminInventoryController, PublicProductsController],
  providers: [ProductsService, ProductsSeedService],
  exports: [ProductsService, ProductsSeedService, MongooseModule],
})
export class ProductsModule {}
