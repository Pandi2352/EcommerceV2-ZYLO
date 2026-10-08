import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument, ProductStatus } from './schemas/product.schema';
import { Brand, BrandDocument } from '../brands/schemas/brand.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { AdminInventoryQueryDto } from './dto/admin-inventory-query.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { generateUniqueSlug } from '../../common/utils/slug.util';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @Optional() private readonly uploadsService?: UploadsService,
  ) {}

  /**
   * Helper to generate a collision-proof SKU
   */
  async generateUniqueSku(brandName?: string): Promise<string> {
    const prefix = brandName
      ? brandName.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase()
      : 'ZY';
    for (let attempts = 0; attempts < 10; attempts++) {
      const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
      const sku = `ZY-${prefix}-${randomPart}`;
      const exists = await this.productModel.exists({ sku });
      if (!exists) return sku;
    }
    return `ZY-${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }

  /**
   * Create a new catalog product
   */
  async create(dto: CreateProductDto): Promise<ProductDocument> {
    // 1. Verify Category exists
    if (!Types.ObjectId.isValid(dto.categoryId)) {
      throw new BadRequestException('Invalid category ID format');
    }
    const categoryExists = await this.categoryModel.exists({ _id: new Types.ObjectId(dto.categoryId) });
    if (!categoryExists) {
      throw new NotFoundException(`Category with ID "${dto.categoryId}" not found`);
    }

    // 2. Verify Brand exists
    if (!Types.ObjectId.isValid(dto.brandId)) {
      throw new BadRequestException('Invalid brand ID format');
    }
    const brand = await this.brandModel.findById(new Types.ObjectId(dto.brandId));
    if (!brand) {
      throw new NotFoundException(`Brand with ID "${dto.brandId}" not found`);
    }

    // 3. Generate collision-proof slug
    const finalSlug = await generateUniqueSlug(this.productModel, dto.name, dto.slug);

    // 4. Generate or validate SKU
    let finalSku = dto.sku ? dto.sku.trim().toUpperCase() : '';
    if (!finalSku) {
      finalSku = await this.generateUniqueSku(brand.name);
    } else {
      const skuExists = await this.productModel.exists({ sku: finalSku });
      if (skuExists) {
        throw new ConflictException(`SKU "${finalSku}" is already in use by another product`);
      }
    }

    // 5. Determine primary thumbnail
    let thumbnail = dto.thumbnailUrl?.trim() || null;
    if (!thumbnail && dto.images && dto.images.length > 0) {
      const primaryImg = dto.images.find((img) => img.isPrimary) || dto.images[0];
      thumbnail = primaryImg.url;
    }

    // 6. Build document
    const product = new this.productModel({
      ...dto,
      categoryId: new Types.ObjectId(dto.categoryId),
      brandId: new Types.ObjectId(dto.brandId),
      slug: finalSlug,
      sku: finalSku,
      thumbnailUrl: thumbnail,
      status: dto.status || 'DRAFT',
    });

    const saved = await product.save();

    // 7. Increment Brand productCount
    await this.brandModel.findByIdAndUpdate(brand._id, { $inc: { productCount: 1 } });

    this.logger.log(`Created product "${saved.name}" (SKU: ${saved.sku})`);
    return this.findById(saved._id.toString());
  }

  /**
   * Query products with multi-facet filters, search, and pagination
   */
  async findAll(query: QueryProductDto, isAdmin = false) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    // Customer view can only see PUBLISHED products
    if (!isAdmin) {
      filter.status = 'PUBLISHED';
    } else if (query.status) {
      filter.status = query.status;
    }

    // Search
    if (query.search?.trim()) {
      const term = query.search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { sku: { $regex: term, $options: 'i' } },
        { tags: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    // Category filter (single or multi-select)
    if (query.categoryIds?.trim()) {
      const ids = query.categoryIds
        .split(',')
        .map((s) => s.trim())
        .filter((s) => Types.ObjectId.isValid(s))
        .map((s) => new Types.ObjectId(s));
      if (ids.length > 0) {
        filter.categoryId = { $in: ids };
      }
    } else if (query.categoryId?.trim()) {
      if (Types.ObjectId.isValid(query.categoryId)) {
        filter.categoryId = new Types.ObjectId(query.categoryId);
      }
    }

    // Brand filter (single or multi-select)
    if (query.brandIds?.trim()) {
      const ids = query.brandIds
        .split(',')
        .map((s) => s.trim())
        .filter((s) => Types.ObjectId.isValid(s))
        .map((s) => new Types.ObjectId(s));
      if (ids.length > 0) {
        filter.brandId = { $in: ids };
      }
    } else if (query.brandId?.trim()) {
      if (Types.ObjectId.isValid(query.brandId)) {
        filter.brandId = new Types.ObjectId(query.brandId);
      }
    }

    // Featured filter
    if (query.isFeatured !== undefined) {
      filter.isFeatured = query.isFeatured;
    }

    // New Arrival filter
    if (query.isNewArrival !== undefined) {
      filter.isNewArrival = query.isNewArrival;
    }

    // In-Stock Only filter
    if (query.inStockOnly === true) {
      filter.stockQuantity = { $gt: 0 };
    }

    // Minimum Rating filter
    if (query.minRating !== undefined && query.minRating > 0) {
      filter.ratingAverage = { $gte: Number(query.minRating) };
    }

    // Price range
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.basePrice = {};
      if (query.minPrice !== undefined) filter.basePrice.$gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) filter.basePrice.$lte = Number(query.maxPrice);
    }

    // Stock Status
    if (query.stockStatus) {
      if (query.stockStatus === 'OUT_OF_STOCK') {
        filter.stockQuantity = { $lte: 0 };
      } else if (query.stockStatus === 'LOW_STOCK') {
        filter.$expr = {
          $and: [
            { $gt: ['$stockQuantity', 0] },
            { $lte: ['$stockQuantity', '$lowStockThreshold'] },
          ],
        };
      } else if (query.stockStatus === 'IN_STOCK') {
        filter.stockQuantity = { $gt: 0 };
      }
    }

    // Sorting
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    switch (query.sortBy) {
      case 'price_asc':
        sortOptions = { basePrice: 1 };
        break;
      case 'price_desc':
        sortOptions = { basePrice: -1 };
        break;
      case 'name_asc':
        sortOptions = { name: 1 };
        break;
      case 'rating':
        sortOptions = { ratingAverage: -1, ratingCount: -1 };
        break;
      case 'stock':
        sortOptions = { stockQuantity: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId', 'name slug iconUrl')
        .populate('brandId', 'name slug logoUrl')
        .sort(sortOptions as any)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
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
   * Find a single product by ObjectId
   */
  async findById(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }
    const product = await this.productModel
      .findById(new Types.ObjectId(id))
      .populate('categoryId', 'name slug iconUrl')
      .populate('brandId', 'name slug logoUrl')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  /**
   * Find product by unique slug
   */
  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findOne({ slug: slug.toLowerCase().trim() })
      .populate('categoryId', 'name slug iconUrl')
      .populate('brandId', 'name slug logoUrl')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    return product;
  }

  /**
   * Find related products by category or brand, backfilling if needed
   */
  async getRelatedProducts(slug: string, limit = 4): Promise<ProductDocument[]> {
    const target = await this.findBySlug(slug);
    const categoryId = target.categoryId ? ((target.categoryId as any)._id || target.categoryId) : null;
    const brandId = target.brandId ? ((target.brandId as any)._id || target.brandId) : null;
    const targetLimit = Number(limit) || 4;

    const filter: any = {
      _id: { $ne: target._id },
      status: 'PUBLISHED',
    };

    if (categoryId) {
      filter.categoryId = categoryId;
    } else if (brandId) {
      filter.brandId = brandId;
    }

    let related = await this.productModel
      .find(filter)
      .populate('categoryId', 'name slug iconUrl')
      .populate('brandId', 'name slug logoUrl')
      .limit(targetLimit)
      .exec();

    // If fewer than requested items found, backfill with other published items
    if (related.length < targetLimit) {
      const remaining = targetLimit - related.length;
      const existingIds = [target._id, ...related.map((p) => p._id)];
      const backfill = await this.productModel
        .find({
          _id: { $nin: existingIds },
          status: 'PUBLISHED',
        })
        .populate('categoryId', 'name slug iconUrl')
        .populate('brandId', 'name slug logoUrl')
        .limit(remaining)
        .exec();
      related = [...related, ...backfill];
    }

    return related;
  }

  /**
   * Update an existing product
   */
  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.findById(id);

    // If category changed, verify new one exists
    if (dto.categoryId && dto.categoryId !== product.categoryId?.toString()) {
      if (!Types.ObjectId.isValid(dto.categoryId)) {
        throw new BadRequestException('Invalid category ID');
      }
      const categoryExists = await this.categoryModel.exists({ _id: new Types.ObjectId(dto.categoryId) });
      if (!categoryExists) {
        throw new NotFoundException(`Category "${dto.categoryId}" not found`);
      }
      product.categoryId = new Types.ObjectId(dto.categoryId) as any;
    }

    // If brand changed, verify new one exists and update counts
    if (dto.brandId && dto.brandId !== product.brandId?.toString()) {
      if (!Types.ObjectId.isValid(dto.brandId)) {
        throw new BadRequestException('Invalid brand ID');
      }
      const newBrand = await this.brandModel.findById(new Types.ObjectId(dto.brandId));
      if (!newBrand) {
        throw new NotFoundException(`Brand "${dto.brandId}" not found`);
      }
      const oldBrandId = product.brandId;
      product.brandId = new Types.ObjectId(dto.brandId) as any;

      // Update brand product counts
      if (oldBrandId) {
        await this.brandModel.findByIdAndUpdate(oldBrandId, { $inc: { productCount: -1 } });
      }
      await this.brandModel.findByIdAndUpdate(newBrand._id, { $inc: { productCount: 1 } });
    }

    // If name changed, handle slug
    if (dto.name && dto.name.trim() !== product.name) {
      product.name = dto.name.trim();
      if (!dto.slug) {
        product.slug = await generateUniqueSlug(this.productModel, dto.name, undefined, product._id.toString());
      }
    }
    if (dto.slug && dto.slug.trim() !== product.slug) {
      product.slug = await generateUniqueSlug(this.productModel, dto.name || product.name, dto.slug, product._id.toString());
    }

    // If SKU changed, verify uniqueness
    if (dto.sku && dto.sku.trim().toUpperCase() !== product.sku) {
      const newSku = dto.sku.trim().toUpperCase();
      const existingSku = await this.productModel.findOne({ sku: newSku, _id: { $ne: product._id } });
      if (existingSku) {
        throw new ConflictException(`SKU "${newSku}" is already taken by another product`);
      }
      product.sku = newSku;
    }

    // Thumbnail updates
    if (dto.thumbnailUrl !== undefined) {
      product.thumbnailUrl = dto.thumbnailUrl?.trim() || null;
    } else if (dto.images && dto.images.length > 0) {
      const primary = dto.images.find((img) => img.isPrimary) || dto.images[0];
      product.thumbnailUrl = primary.url;
    }

    // Assign other scalar & array fields
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.shortDescription !== undefined) product.shortDescription = dto.shortDescription;
    if (dto.barcode !== undefined) product.barcode = dto.barcode;
    if (dto.tags !== undefined) product.tags = dto.tags;
    if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;
    if (dto.salePrice !== undefined) product.salePrice = dto.salePrice;
    if (dto.costPrice !== undefined) product.costPrice = dto.costPrice;
    if (dto.currency !== undefined) product.currency = dto.currency;
    if (dto.trackInventory !== undefined) product.trackInventory = dto.trackInventory;
    if (dto.stockQuantity !== undefined) product.stockQuantity = dto.stockQuantity;
    if (dto.lowStockThreshold !== undefined) product.lowStockThreshold = dto.lowStockThreshold;
    if (dto.allowBackorders !== undefined) product.allowBackorders = dto.allowBackorders;
    if (dto.images !== undefined) product.images = dto.images as any;
    if (dto.specifications !== undefined) product.specifications = dto.specifications;
    if (dto.hasVariants !== undefined) product.hasVariants = dto.hasVariants;
    if (dto.variants !== undefined) product.variants = dto.variants as any;
    if (dto.volumeTiers !== undefined) product.volumeTiers = dto.volumeTiers as any;
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.isNewArrival !== undefined) product.isNewArrival = dto.isNewArrival;
    if (dto.seo !== undefined) product.seo = dto.seo as any;

    await product.save();
    return this.findById(product._id.toString());
  }

  /**
   * Delete or archive product
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const product = await this.findById(id);

    // If currently PUBLISHED or DRAFT, soft-archive it first
    if (product.status !== 'ARCHIVED') {
      product.status = 'ARCHIVED';
      await product.save();
      return { success: true, message: `Product "${product.name}" moved to archives.` };
    }

    // If already ARCHIVED, delete permanently
    await this.productModel.findByIdAndDelete(product._id);
    if (product.brandId) {
      await this.brandModel.findByIdAndUpdate(product.brandId, { $inc: { productCount: -1 } });
    }

    // Clean up local orphaned images if any
    if (this.uploadsService) {
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img?.url && (img.url.includes('/uploads/') || img.url.startsWith('/uploads/'))) {
            await this.uploadsService.deleteFile(img.url).catch(() => null);
          }
        }
      }
      if (product.thumbnailUrl && (product.thumbnailUrl.includes('/uploads/') || product.thumbnailUrl.startsWith('/uploads/'))) {
        await this.uploadsService.deleteFile(product.thumbnailUrl).catch(() => null);
      }
    }

    return { success: true, message: `Product "${product.name}" permanently deleted.` };
  }

  /**
   * Quick status change
   */
  async updateStatus(id: string, status: ProductStatus): Promise<ProductDocument> {
    const product = await this.findById(id);
    product.status = status;
    await product.save();
    return product;
  }

  /**
   * Quick featured toggle
   */
  async toggleFeatured(id: string): Promise<ProductDocument> {
    const product = await this.findById(id);
    product.isFeatured = !product.isFeatured;
    await product.save();
    return product;
  }

  /**
   * Get KPI Metrics for admin dashboard
   */
  async getMetrics() {
    const [
      totalProducts,
      publishedProducts,
      draftProducts,
      archivedProducts,
      featuredProducts,
      lowStockProducts,
      outOfStockProducts,
      uniqueBrandsCount,
    ] = await Promise.all([
      this.productModel.countDocuments({ status: { $ne: 'ARCHIVED' } }),
      this.productModel.countDocuments({ status: 'PUBLISHED' }),
      this.productModel.countDocuments({ status: 'DRAFT' }),
      this.productModel.countDocuments({ status: 'ARCHIVED' }),
      this.productModel.countDocuments({ isFeatured: true, status: 'PUBLISHED' }),
      this.productModel.countDocuments({
        status: { $ne: 'ARCHIVED' },
        $expr: {
          $and: [
            { $gt: ['$stockQuantity', 0] },
            { $lte: ['$stockQuantity', '$lowStockThreshold'] },
          ],
        },
      }),
      this.productModel.countDocuments({ status: { $ne: 'ARCHIVED' }, stockQuantity: 0 }),
      this.productModel.distinct('brandId', { status: { $ne: 'ARCHIVED' } }).then((b) => b.length),
    ]);

    return {
      totalProducts,
      publishedProducts,
      draftProducts,
      archivedProducts,
      featuredProducts,
      lowStockProducts,
      outOfStockProducts,
      uniqueBrandsCount,
    };
  }

  /**
   * Get comprehensive aggregated overview data for Products Overview page.
   */
  async getOverview() {
    let products: any[] = [];
    try {
      products = await this.productModel
        .find({ name: { $exists: true, $ne: null } })
        .populate('categoryId', 'name slug')
        .populate('brandId', 'name slug logoUrl')
        .lean()
        .exec();
    } catch (err: any) {
      this.logger.warn(`Populate failed during getOverview, falling back: ${err?.message || err}`);
      products = await this.productModel.find({ name: { $exists: true, $ne: null } }).lean().exec();
    }

    const totalProducts = products.length;
    let published = 0;
    let draft = 0;
    let archived = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let featured = 0;
    let newArrivals = 0;
    let withDiscount = 0;
    let withVariants = 0;
    let totalInventoryValue = 0;
    let totalStockUnits = 0;
    let totalPriceSum = 0;

    const categoryMap = new Map<string, { id: string; name: string; count: number }>();
    const brandMap = new Map<string, { id: string; name: string; logoUrl?: string; count: number }>();

    let budgetCount = 0;
    let midRangeCount = 0;
    let premiumCount = 0;
    let luxuryCount = 0;

    for (const p of products) {
      if (p.status === 'PUBLISHED') published++;
      else if (p.status === 'DRAFT') draft++;
      else if (p.status === 'ARCHIVED') archived++;

      const stock = Number(p.stockQuantity) || 0;
      const threshold = Number(p.lowStockThreshold) || 5;
      totalStockUnits += stock;

      const price = Number(p.basePrice) || 0;
      totalPriceSum += price;
      totalInventoryValue += price * stock;

      if (stock === 0) {
        outOfStock++;
      } else if (stock <= threshold) {
        lowStock++;
      } else {
        inStock++;
      }

      if (p.isFeatured) featured++;
      if (p.isNewArrival) newArrivals++;
      if (p.salePrice && Number(p.salePrice) < price) withDiscount++;
      if (p.hasVariants && p.variants && p.variants.length > 0) withVariants++;

      // Price tiers
      if (price < 100) budgetCount++;
      else if (price <= 300) midRangeCount++;
      else if (price <= 700) premiumCount++;
      else luxuryCount++;

      // Category attribution
      if (p.categoryId) {
        const catId = p.categoryId._id ? p.categoryId._id.toString() : p.categoryId.toString();
        const catName = p.categoryId.name || 'Uncategorized';
        const curr = categoryMap.get(catId) || { id: catId, name: catName, count: 0 };
        curr.count++;
        categoryMap.set(catId, curr);
      }

      // Brand attribution
      if (p.brandId) {
        const bId = p.brandId._id ? p.brandId._id.toString() : p.brandId.toString();
        const bName = p.brandId.name || 'Generic';
        const bLogo = p.brandId.logoUrl;
        const curr = brandMap.get(bId) || { id: bId, name: bName, logoUrl: bLogo, count: 0 };
        curr.count++;
        brandMap.set(bId, curr);
      }
    }

    const categoryDistribution = Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((c) => ({
        ...c,
        percentage: totalProducts > 0 ? Math.round((c.count / totalProducts) * 100) : 0,
      }));

    const brandDistribution = Array.from(brandMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((b) => ({
        ...b,
        percentage: totalProducts > 0 ? Math.round((b.count / totalProducts) * 100) : 0,
      }));

    const averagePrice = totalProducts > 0 ? Math.round((totalPriceSum / totalProducts) * 100) / 100 : 0;

    // Recent 6 products
    const recentProducts = [...products]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6)
      .map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        thumbnailUrl: p.thumbnailUrl || (p.images && p.images[0]?.url) || null,
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        stockQuantity: p.stockQuantity,
        status: p.status,
        isFeatured: Boolean(p.isFeatured),
        isNewArrival: Boolean(p.isNewArrival),
        categoryName: p.categoryId?.name || 'Uncategorized',
        brandName: p.brandId?.name || 'Generic',
        createdAt: p.createdAt,
      }));

    return {
      generatedAt: new Date().toISOString(),
      summary: {
        totalProducts,
        published,
        draft,
        archived,
        inStock,
        lowStock,
        outOfStock,
        featured,
        newArrivals,
        withDiscount,
        withVariants,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        averagePrice,
        totalStockUnits,
      },
      stockStatusBreakdown: [
        { key: 'inStock', label: 'Healthy Stock', value: inStock, color: '#10b981' },
        { key: 'lowStock', label: 'Low Stock Alert', value: lowStock, color: '#f59e0b' },
        { key: 'outOfStock', label: 'Out of Stock', value: outOfStock, color: '#f43f5e' },
      ],
      priceTierBreakdown: [
        { key: 'budget', label: 'Entry (< $100)', value: budgetCount, color: '#3b82f6' },
        { key: 'mid', label: 'Mid-Range ($100–$300)', value: midRangeCount, color: '#6366f1' },
        { key: 'premium', label: 'Premium ($300–$700)', value: premiumCount, color: '#8b5cf6' },
        { key: 'luxury', label: 'Flagship & Luxury ($700+)', value: luxuryCount, color: '#ec4899' },
      ],
      merchandising: {
        featured,
        standard: totalProducts - featured,
        newArrivals,
        standardArrivals: totalProducts - newArrivals,
        withDiscount,
        fullPrice: totalProducts - withDiscount,
        withVariants,
        singleSku: totalProducts - withVariants,
      },
      categoryDistribution,
      brandDistribution,
      recentProducts,
    };
  }

  /**
   * Dynamic facet counts for storefront filtering (categories with counts, brands with counts, price min/max)
   */
  async getFacets() {
    const products: any[] = await this.productModel
      .find({ status: 'PUBLISHED' })
      .select('categoryId brandId basePrice stockQuantity ratingAverage')
      .populate('categoryId', 'name slug parentId')
      .populate('brandId', 'name slug logoUrl')
      .lean()
      .exec();

    const categoryMap = new Map<string, { id: string; name: string; slug: string; parentId?: string; count: number }>();
    const brandMap = new Map<string, { id: string; name: string; slug: string; logoUrl?: string; count: number }>();

    let minPrice = Infinity;
    let maxPrice = 0;
    let inStockCount = 0;

    for (const p of products) {
      const price = Number(p.basePrice) || 0;
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
      if ((p.stockQuantity || 0) > 0) inStockCount++;

      if (p.categoryId) {
        const catId = p.categoryId._id ? p.categoryId._id.toString() : p.categoryId.toString();
        const catName = p.categoryId.name || 'Uncategorized';
        const catSlug = p.categoryId.slug || '';
        const parentId = p.categoryId.parentId ? p.categoryId.parentId.toString() : undefined;
        const curr = categoryMap.get(catId) || { id: catId, name: catName, slug: catSlug, parentId, count: 0 };
        curr.count++;
        categoryMap.set(catId, curr);
      }

      if (p.brandId) {
        const bId = p.brandId._id ? p.brandId._id.toString() : p.brandId.toString();
        const bName = p.brandId.name || 'Generic';
        const bSlug = p.brandId.slug || '';
        const logoUrl = p.brandId.logoUrl;
        const curr = brandMap.get(bId) || { id: bId, name: bName, slug: bSlug, logoUrl, count: 0 };
        curr.count++;
        brandMap.set(bId, curr);
      }
    }

    return {
      total: products.length,
      inStockCount,
      priceRange: {
        min: minPrice === Infinity ? 0 : Math.floor(minPrice),
        max: maxPrice === 0 ? 1000 : Math.ceil(maxPrice),
      },
      categories: Array.from(categoryMap.values()).sort((a, b) => b.count - a.count),
      brands: Array.from(brandMap.values()).sort((a, b) => b.count - a.count),
    };
  }

  /**
   * Fast autocomplete search suggestions for navbar typeahead
   */
  async getSuggestions(keyword: string) {
    if (!keyword || !keyword.trim()) return [];
    const term = keyword.trim();
    const regex = new RegExp(term, 'i');

    const products = await this.productModel
      .find({
        status: 'PUBLISHED',
        $or: [
          { name: regex },
          { sku: regex },
          { tags: regex },
        ],
      })
      .select('name slug sku thumbnailUrl basePrice salePrice categoryId brandId')
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug')
      .limit(6)
      .lean()
      .exec();

    return products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      thumbnailUrl: p.thumbnailUrl || null,
      basePrice: p.basePrice,
      salePrice: p.salePrice || null,
      categoryName: (p.categoryId as any)?.name || 'Product',
      brandName: (p.brandId as any)?.name || 'Brand',
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ADMIN INVENTORY & STOCK CONTROL
  // ─────────────────────────────────────────────────────────────────────────────

  async getInventorySummary() {
    const products = await this.productModel
      .find({}, 'stockQuantity lowStockThreshold basePrice status')
      .lean()
      .exec();

    const totalProducts = products.length;
    let totalStockUnits = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    for (const p of products) {
      const stock = p.stockQuantity ?? 0;
      const threshold = p.lowStockThreshold ?? 5;
      const price = p.basePrice ?? 0;

      totalStockUnits += stock;
      totalValuation += stock * price;

      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= threshold) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    }

    return {
      totalProducts,
      totalStockUnits,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalValuation: Math.round(totalValuation * 100) / 100,
    };
  }

  async getInventoryList(query: AdminInventoryQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.status && query.status !== 'ALL') {
      if (query.status === 'OUT_OF_STOCK') {
        filter.stockQuantity = { $lte: 0 };
      } else if (query.status === 'LOW_STOCK') {
        filter.stockQuantity = { $gt: 0, $lte: 5 };
      } else if (query.status === 'IN_STOCK') {
        filter.stockQuantity = { $gt: 5 };
      }
    }

    if (query.categoryId && Types.ObjectId.isValid(query.categoryId)) {
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }

    if (query.brandId && Types.ObjectId.isValid(query.brandId)) {
      filter.brandId = new Types.ObjectId(query.brandId);
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { name: regex },
        { sku: regex },
        { 'variants.sku': regex },
        { 'variants.title': regex },
      ];
    }

    const sortObj: Record<string, 1 | -1> = {};
    if (query.sortBy === 'stock_desc') {
      sortObj.stockQuantity = -1;
    } else if (query.sortBy === 'name') {
      sortObj.name = 1;
    } else if (query.sortBy === 'recent') {
      sortObj.createdAt = -1;
    } else if (query.sortBy === 'price_desc') {
      sortObj.basePrice = -1;
    } else {
      // Default: lowest stock first (urgent items at top)
      sortObj.stockQuantity = 1;
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId', 'name slug')
        .populate('brandId', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    const formatted = items.map((p: any) => {
      const stock = p.stockQuantity ?? 0;
      const threshold = p.lowStockThreshold ?? 5;
      let stockStatus = 'IN_STOCK';
      if (stock <= 0) stockStatus = 'OUT_OF_STOCK';
      else if (stock <= threshold) stockStatus = 'LOW_STOCK';

      return {
        _id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        thumbnailUrl: p.thumbnailUrl || (p.images && p.images[0]?.url) || null,
        category: p.categoryId
          ? { _id: p.categoryId._id.toString(), name: p.categoryId.name, slug: p.categoryId.slug }
          : null,
        brand: p.brandId
          ? { _id: p.brandId._id.toString(), name: p.brandId.name, slug: p.brandId.slug }
          : null,
        basePrice: p.basePrice,
        salePrice: p.salePrice || null,
        stockQuantity: stock,
        lowStockThreshold: threshold,
        trackInventory: p.trackInventory !== false,
        allowBackorders: Boolean(p.allowBackorders),
        status: p.status,
        stockStatus,
        inventoryValuation: Math.round(stock * p.basePrice * 100) / 100,
        variants: (p.variants || []).map((v: any) => ({
          sku: v.sku,
          title: v.title,
          price: v.price,
          salePrice: v.salePrice || null,
          stockQuantity: v.stockQuantity ?? 0,
          isActive: v.isActive !== false,
        })),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async adjustInventoryStock(productId: string, dto: AdjustStockDto) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    if (dto.variantSku && product.variants?.length) {
      const variantIndex = product.variants.findIndex((v) => v.sku === dto.variantSku);
      if (variantIndex === -1) {
        throw new NotFoundException(
          `Variant with SKU "${dto.variantSku}" not found on product "${product.name}"`,
        );
      }

      const currentVariantStock = product.variants[variantIndex].stockQuantity ?? 0;
      let newVariantStock = currentVariantStock;

      if (dto.type === 'SET') {
        newVariantStock = dto.quantity;
      } else if (dto.type === 'INCREMENT') {
        newVariantStock = currentVariantStock + dto.quantity;
      } else if (dto.type === 'DECREMENT') {
        newVariantStock = Math.max(0, currentVariantStock - dto.quantity);
      }

      product.variants[variantIndex].stockQuantity = newVariantStock;

      // Recalculate total stock from variants
      product.stockQuantity = product.variants.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0);
    } else {
      const currentStock = product.stockQuantity ?? 0;
      let newStock = currentStock;

      if (dto.type === 'SET') {
        newStock = dto.quantity;
      } else if (dto.type === 'INCREMENT') {
        newStock = currentStock + dto.quantity;
      } else if (dto.type === 'DECREMENT') {
        newStock = Math.max(0, currentStock - dto.quantity);
      }

      product.stockQuantity = newStock;

      // If exactly 1 variant exists, sync it
      if (product.variants?.length === 1) {
        product.variants[0].stockQuantity = newStock;
      }
    }

    if (dto.lowStockThreshold !== undefined) {
      product.lowStockThreshold = dto.lowStockThreshold;
    }
    if (dto.trackInventory !== undefined) {
      product.trackInventory = dto.trackInventory;
    }
    if (dto.allowBackorders !== undefined) {
      product.allowBackorders = dto.allowBackorders;
    }

    await product.save();

    this.logger.log(
      `Adjusted inventory for "${product.name}" (SKU: ${product.sku}) - New stock: ${product.stockQuantity}${
        dto.variantSku ? ` (Variant ${dto.variantSku})` : ''
      }`,
    );

    return {
      message: 'Inventory updated successfully',
      productId: product._id.toString(),
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      trackInventory: product.trackInventory,
      allowBackorders: product.allowBackorders,
      variants: product.variants,
    };
  }
}
