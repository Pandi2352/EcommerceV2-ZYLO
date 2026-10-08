import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bundle, BundleDocument } from './schemas/bundle.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class BundlesSeedService implements OnModuleInit {
  private readonly logger = new Logger(BundlesSeedService.name);

  constructor(
    @InjectModel(Bundle.name)
    private readonly bundleModel: Model<BundleDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async onModuleInit() {
    await this.seedBundles();
  }

  async seedBundles() {
    const count = await this.bundleModel.countDocuments().exec();
    if (count > 0) {
      this.logger.log(`Bundles collection already has ${count} records. Skipping seed.`);
      return;
    }

    this.logger.log('Seeding initial premier product bundles...');

    const seedConfigs = [
      {
        title: 'Apple iPhone 16 Pro Max Creator Suite',
        slug: 'apple-iphone-16-pro-max-creator-suite',
        badgeText: 'Frequently Bought Together',
        description: 'Pair your flagship iPhone 16 Pro Max with studio-grade AirPods Max and versatile iPad Air for ultimate productivity and content creation.',
        primaryProductSlug: 'apple-iphone-16-pro-max',
        companionSlugs: ['apple-airpods-max', 'apple-ipad-air-11-m2'],
        bundleDiscountPercent: 15,
      },
      {
        title: 'Sony Alpha Pro Cine & Audio Setup',
        slug: 'sony-alpha-pro-cine-and-audio-setup',
        badgeText: 'Complete Creator Kit',
        description: 'Professional 61MP full-frame visual capture combined with active noise cancelling monitor audio.',
        primaryProductSlug: 'sony-alpha-a7r-v-full-frame-camera',
        companionSlugs: ['sony-wf-1000xm5-noise-canceling-earbuds'],
        bundleDiscountPercent: 12,
      },
      {
        title: 'Nike Athletic Streetwear Collection',
        slug: 'nike-athletic-streetwear-collection',
        badgeText: 'Frequently Bought Together',
        description: 'The iconic high-top silhouette paired with premium thermal Tech Fleece and lightweight responsive road runners.',
        primaryProductSlug: 'nike-air-jordan-1-retro-high-og',
        companionSlugs: ['nike-tech-fleece-full-zip-windrunner', 'nike-pegasus-41-road-running-shoes'],
        bundleDiscountPercent: 15,
      },
      {
        title: 'Ultimate Precision Workspace & Audio Station',
        slug: 'ultimate-precision-workspace-and-audio-station',
        badgeText: 'Power User Bundle',
        description: 'Unleash elite workflow ergonomics and immersive spatial sound with the MX Master 3S and Sonos Era 300.',
        primaryProductSlug: 'razer-blade-16-gaming-laptop',
        companionSlugs: ['logitech-mx-master-3s-wireless-mouse', 'sonos-era-300-spatial-audio-speaker'],
        bundleDiscountPercent: 10,
      },
      {
        title: 'Breville Artisan Barista Starter Kit',
        slug: 'breville-artisan-barista-starter-kit',
        badgeText: 'Frequently Bought Together',
        description: 'Everything required to craft third-wave specialty espresso at home from day one.',
        primaryProductSlug: 'breville-barista-touch-espresso-machine',
        companionSlugs: ['dyson-v15-detect-cordless-vacuum'],
        bundleDiscountPercent: 10,
      },
    ];

    let seeded = 0;
    for (const conf of seedConfigs) {
      const primaryProduct = await this.productModel.findOne({ slug: conf.primaryProductSlug }).exec();
      if (!primaryProduct) {
        this.logger.warn(`Primary product "${conf.primaryProductSlug}" not found, skipping bundle "${conf.title}"`);
        continue;
      }

      const companionItems: any[] = [];
      for (const compSlug of conf.companionSlugs) {
        const comp = await this.productModel.findOne({ slug: compSlug }).exec();
        if (comp) {
          companionItems.push({
            productId: comp._id,
            variantSku: null,
            discountPercent: conf.bundleDiscountPercent,
            isOptional: true,
            displayOrder: companionItems.length,
          });
        }
      }

      if (companionItems.length === 0) {
        this.logger.warn(`No companion products found for bundle "${conf.title}", skipping.`);
        continue;
      }

      await this.bundleModel.create({
        title: conf.title,
        slug: conf.slug,
        badgeText: conf.badgeText,
        description: conf.description,
        primaryProductId: primaryProduct._id,
        items: companionItems,
        bundleDiscountPercent: conf.bundleDiscountPercent,
        bundleFixedPrice: null,
        isActive: true,
        displayOrder: seeded,
      });

      seeded++;
    }

    this.logger.log(`Successfully seeded ${seeded} product bundles.`);
  }
}
