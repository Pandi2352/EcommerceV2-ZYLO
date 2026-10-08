import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bundle, BundleSchema } from './schemas/bundle.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { BundlesService } from './bundles.service';
import { BundlesSeedService } from './bundles-seed.service';
import { PublicBundlesController, AdminBundlesController } from './bundles.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bundle.name, schema: BundleSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [PublicBundlesController, AdminBundlesController],
  providers: [BundlesService, BundlesSeedService],
  exports: [BundlesService],
})
export class BundlesModule {}
