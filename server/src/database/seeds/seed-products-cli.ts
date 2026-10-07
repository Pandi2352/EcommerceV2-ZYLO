import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { Product, ProductSchema } from '../../modules/products/schemas/product.schema';
import { Brand, BrandSchema } from '../../modules/brands/schemas/brand.schema';
import { Category, CategorySchema } from '../../modules/categories/schemas/category.schema';
import { ProductsSeedService } from '../../modules/products/products-seed.service';

async function main() {
  console.log('Starting Products & Catalog Seeder Runner...');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zylo';
  const conn = await mongoose.createConnection(mongoUri).asPromise();
  console.log('Connected to MongoDB.');

  try {
    const productModel = conn.model(Product.name, ProductSchema);
    const brandModel = conn.model(Brand.name, BrandSchema);
    const categoryModel = conn.model(Category.name, CategorySchema);

    const seeder = new ProductsSeedService(
      productModel as any,
      brandModel as any,
      categoryModel as any,
    );

    const result = await seeder.seed();
    console.log(`Products seeding completed: ${result.seeded} seeded, ${result.existing} existing.`);
    process.exit(0);
  } catch (err: any) {
    console.error('Products seed error:', err?.message || err);
    process.exit(1);
  } finally {
    await conn.close();
  }
}

main();
