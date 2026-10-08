import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bundle, BundleDocument } from './schemas/bundle.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { QueryBundleDto } from './dto/query-bundle.dto';
import { generateUniqueSlug } from '../../common/utils/slug.util';

@Injectable()
export class BundlesService {
  private readonly logger = new Logger(BundlesService.name);

  constructor(
    @InjectModel(Bundle.name)
    private readonly bundleModel: Model<BundleDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  /**
   * Public: Retrieve enriched active bundles for a product page
   */
  async getBundlesForProduct(idOrSlug: string) {
    let targetProduct: ProductDocument | null = null;
    if (Types.ObjectId.isValid(idOrSlug)) {
      targetProduct = await this.productModel.findById(new Types.ObjectId(idOrSlug)).exec();
    }
    if (!targetProduct) {
      targetProduct = await this.productModel.findOne({ slug: idOrSlug.toLowerCase().trim() }).exec();
    }

    if (!targetProduct) {
      throw new NotFoundException(`Product "${idOrSlug}" not found`);
    }

    const bundles = await this.bundleModel
      .find({
        primaryProductId: targetProduct._id,
        isActive: true,
      })
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate('primaryProductId', 'name slug basePrice salePrice thumbnailUrl images stockQuantity trackInventory status')
      .populate('items.productId', 'name slug basePrice salePrice thumbnailUrl images stockQuantity trackInventory status')
      .exec();

    // Map and enrich each bundle with live commercial totals
    return bundles.map((b) => this.enrichBundleCalculations(b));
  }

  /**
   * Enriches a bundle with live item pricing, bundle discount, and savings calculations
   */
  private enrichBundleCalculations(bundle: BundleDocument) {
    const raw = bundle.toObject();
    const primary = raw.primaryProductId as any;

    if (!primary) return null;

    // Filter valid active items
    const validItems: any[] = [];

    // 1. Primary Product as First Bundle Element
    const primaryBasePrice = primary.basePrice || 0;
    const primarySalePrice = primary.salePrice && primary.salePrice > 0 ? primary.salePrice : primaryBasePrice;
    const primaryBundleDisc = bundle.bundleDiscountPercent || 0;
    const primaryDiscountedPrice = +(primarySalePrice * (1 - primaryBundleDisc / 100)).toFixed(2);
    const primarySavings = +(primaryBasePrice - primaryDiscountedPrice).toFixed(2);

    const primaryBundleItem = {
      productId: primary._id,
      name: primary.name,
      slug: primary.slug,
      image: primary.thumbnailUrl || primary.images?.[0]?.url || '',
      basePrice: primaryBasePrice,
      salePrice: primarySalePrice,
      bundlePrice: primaryDiscountedPrice,
      savings: primarySavings,
      discountPercent: primaryBundleDisc,
      stockQuantity: primary.stockQuantity ?? 10,
      trackInventory: primary.trackInventory ?? true,
      inStock: !primary.trackInventory || (primary.stockQuantity ?? 10) > 0,
      isPrimary: true,
      isOptional: false,
    };

    validItems.push(primaryBundleItem);

    // 2. Additional Companion Items
    if (Array.isArray(raw.items)) {
      raw.items.forEach((itemConf: any) => {
        const prod = itemConf.productId;
        if (!prod || prod.status === 'ARCHIVED') return;

        const base = prod.basePrice || 0;
        const sale = prod.salePrice && prod.salePrice > 0 ? prod.salePrice : base;
        const itemDisc = itemConf.discountPercent > 0 ? itemConf.discountPercent : (bundle.bundleDiscountPercent || 0);
        const itemBundlePrice = +(sale * (1 - itemDisc / 100)).toFixed(2);
        const itemSavings = +(base - itemBundlePrice).toFixed(2);

        validItems.push({
          productId: prod._id,
          variantSku: itemConf.variantSku || null,
          name: prod.name,
          slug: prod.slug,
          image: prod.thumbnailUrl || prod.images?.[0]?.url || '',
          basePrice: base,
          salePrice: sale,
          bundlePrice: itemBundlePrice,
          savings: itemSavings,
          discountPercent: itemDisc,
          stockQuantity: prod.stockQuantity ?? 10,
          trackInventory: prod.trackInventory ?? true,
          inStock: !prod.trackInventory || (prod.stockQuantity ?? 10) > 0,
          isPrimary: false,
          isOptional: itemConf.isOptional ?? true,
        });
      });
    }

    // Totals for all items in the kit
    const totalOriginalPrice = +validItems.reduce((sum, item) => sum + item.basePrice, 0).toFixed(2);
    let totalBundlePrice = +validItems.reduce((sum, item) => sum + item.bundlePrice, 0).toFixed(2);

    // Apply fixed bundle price override if set
    if (bundle.bundleFixedPrice != null && bundle.bundleFixedPrice > 0) {
      totalBundlePrice = bundle.bundleFixedPrice;
    }

    const totalSavings = Math.max(0, +(totalOriginalPrice - totalBundlePrice).toFixed(2));
    const effectiveDiscountPercent =
      totalOriginalPrice > 0 ? Math.round((totalSavings / totalOriginalPrice) * 100) : 0;

    return {
      _id: bundle._id,
      title: bundle.title,
      slug: bundle.slug,
      badgeText: bundle.badgeText || 'Frequently Bought Together',
      description: bundle.description,
      primaryProductId: primary._id,
      items: validItems,
      totalOriginalPrice,
      totalBundlePrice,
      totalSavings,
      effectiveDiscountPercent,
      bundleDiscountPercent: bundle.bundleDiscountPercent,
      isActive: bundle.isActive,
    };
  }

  /**
   * Admin: Query all bundles with filters
   */
  async findAllAdmin(query: QueryBundleDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.search?.trim()) {
      const term = query.search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { badgeText: { $regex: term, $options: 'i' } },
      ];
    }

    if (query.isActive !== undefined && query.isActive !== 'ALL') {
      filter.isActive = query.isActive === 'true';
    }

    if (query.productId && Types.ObjectId.isValid(query.productId)) {
      filter.primaryProductId = new Types.ObjectId(query.productId);
    }

    const [items, total] = await Promise.all([
      this.bundleModel
        .find(filter)
        .populate('primaryProductId', 'name slug basePrice thumbnailUrl')
        .populate('items.productId', 'name slug basePrice thumbnailUrl')
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bundleModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Admin: Find bundle by ID
   */
  async findById(id: string): Promise<BundleDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid bundle ID format');
    }
    const bundle = await this.bundleModel
      .findById(new Types.ObjectId(id))
      .populate('primaryProductId', 'name slug basePrice thumbnailUrl')
      .populate('items.productId', 'name slug basePrice thumbnailUrl')
      .exec();

    if (!bundle) {
      throw new NotFoundException(`Bundle with ID "${id}" not found`);
    }
    return bundle;
  }

  /**
   * Admin: Create new bundle kit
   */
  async create(dto: CreateBundleDto): Promise<BundleDocument> {
    if (!Types.ObjectId.isValid(dto.primaryProductId)) {
      throw new BadRequestException('Invalid primary product ID');
    }

    const primaryExists = await this.productModel.exists({ _id: new Types.ObjectId(dto.primaryProductId) });
    if (!primaryExists) {
      throw new NotFoundException(`Primary product with ID "${dto.primaryProductId}" not found`);
    }

    // Verify companion items
    const itemConfigs: any[] = [];
    if (Array.isArray(dto.items)) {
      for (const item of dto.items) {
        if (!Types.ObjectId.isValid(item.productId)) {
          throw new BadRequestException(`Invalid product ID "${item.productId}" in bundle items`);
        }
        const exists = await this.productModel.exists({ _id: new Types.ObjectId(item.productId) });
        if (!exists) {
          throw new NotFoundException(`Bundled product with ID "${item.productId}" not found`);
        }
        itemConfigs.push({
          productId: new Types.ObjectId(item.productId),
          variantSku: item.variantSku || null,
          discountPercent: item.discountPercent || 0,
          isOptional: item.isOptional ?? true,
          displayOrder: item.displayOrder || 0,
        });
      }
    }

    const finalSlug = await generateUniqueSlug(this.bundleModel, dto.title, dto.slug);

    const bundle = new this.bundleModel({
      title: dto.title.trim(),
      slug: finalSlug,
      badgeText: dto.badgeText?.trim() || 'Frequently Bought Together',
      description: dto.description?.trim() || null,
      primaryProductId: new Types.ObjectId(dto.primaryProductId),
      items: itemConfigs,
      bundleDiscountPercent: dto.bundleDiscountPercent ?? 10,
      bundleFixedPrice: dto.bundleFixedPrice || null,
      isActive: dto.isActive ?? true,
      displayOrder: dto.displayOrder || 0,
    });

    const saved = await bundle.save();
    this.logger.log(`Created product bundle "${saved.title}" (slug: ${saved.slug})`);
    return this.findById(saved._id.toString());
  }

  /**
   * Admin: Update bundle
   */
  async update(id: string, dto: UpdateBundleDto): Promise<BundleDocument> {
    const bundle = await this.findById(id);

    if (dto.title && dto.title.trim() !== bundle.title) {
      bundle.title = dto.title.trim();
      if (!dto.slug) {
        bundle.slug = await generateUniqueSlug(this.bundleModel, dto.title, undefined, bundle._id.toString());
      }
    }

    if (dto.slug && dto.slug.trim() !== bundle.slug) {
      bundle.slug = await generateUniqueSlug(this.bundleModel, dto.title || bundle.title, dto.slug, bundle._id.toString());
    }

    if (dto.badgeText !== undefined) bundle.badgeText = dto.badgeText.trim();
    if (dto.description !== undefined) bundle.description = dto.description?.trim() || null;
    if (dto.bundleDiscountPercent !== undefined) bundle.bundleDiscountPercent = dto.bundleDiscountPercent;
    if (dto.bundleFixedPrice !== undefined) bundle.bundleFixedPrice = dto.bundleFixedPrice;
    if (dto.isActive !== undefined) bundle.isActive = dto.isActive;
    if (dto.displayOrder !== undefined) bundle.displayOrder = dto.displayOrder;

    if (dto.primaryProductId && dto.primaryProductId !== bundle.primaryProductId.toString()) {
      if (!Types.ObjectId.isValid(dto.primaryProductId)) {
        throw new BadRequestException('Invalid primary product ID');
      }
      const primaryExists = await this.productModel.exists({ _id: new Types.ObjectId(dto.primaryProductId) });
      if (!primaryExists) {
        throw new NotFoundException(`Primary product with ID "${dto.primaryProductId}" not found`);
      }
      bundle.primaryProductId = new Types.ObjectId(dto.primaryProductId);
    }

    if (dto.items) {
      const itemConfigs: any[] = [];
      for (const item of dto.items) {
        if (!Types.ObjectId.isValid(item.productId)) {
          throw new BadRequestException(`Invalid product ID "${item.productId}" in bundle items`);
        }
        itemConfigs.push({
          productId: new Types.ObjectId(item.productId),
          variantSku: item.variantSku || null,
          discountPercent: item.discountPercent || 0,
          isOptional: item.isOptional ?? true,
          displayOrder: item.displayOrder || 0,
        });
      }
      bundle.items = itemConfigs as any;
    }

    await bundle.save();
    return this.findById(bundle._id.toString());
  }

  /**
   * Admin: Toggle active status
   */
  async toggleActive(id: string): Promise<BundleDocument> {
    const bundle = await this.findById(id);
    bundle.isActive = !bundle.isActive;
    await bundle.save();
    return bundle;
  }

  /**
   * Admin: Delete bundle
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const bundle = await this.findById(id);
    await this.bundleModel.findByIdAndDelete(bundle._id).exec();
    return { success: true, message: `Bundle "${bundle.title}" has been deleted.` };
  }

  /**
   * Admin: High-level KPI metrics
   */
  async getMetrics() {
    const [total, active, bundles] = await Promise.all([
      this.bundleModel.countDocuments().exec(),
      this.bundleModel.countDocuments({ isActive: true }).exec(),
      this.bundleModel.find({}, 'bundleDiscountPercent bundleFixedPrice').exec(),
    ]);

    const avgDiscount =
      bundles.length > 0
        ? Math.round(bundles.reduce((acc, b) => acc + (b.bundleDiscountPercent || 0), 0) / bundles.length)
        : 0;

    const fixedPriceCount = bundles.filter((b) => b.bundleFixedPrice != null && b.bundleFixedPrice > 0).length;

    return {
      totalBundles: total,
      activeBundles: active,
      inactiveBundles: total - active,
      averageDiscountPercent: avgDiscount,
      fixedPriceBundles: fixedPriceCount,
    };
  }
}
