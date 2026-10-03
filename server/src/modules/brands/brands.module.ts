import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './schemas/brand.schema';
import { BrandsService } from './brands.service';
import { BrandsSeedService } from './brands-seed.service';
import { AdminBrandsController } from './admin-brands.controller';
import { PublicBrandsController } from './public-brands.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
  ],
  controllers: [AdminBrandsController, PublicBrandsController],
  providers: [BrandsService, BrandsSeedService],
  exports: [BrandsService, BrandsSeedService, MongooseModule],
})
export class BrandsModule {}
