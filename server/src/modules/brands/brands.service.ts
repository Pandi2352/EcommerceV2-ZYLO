import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
  ) {}

  /**
   * Generates a clean, URL-safe slug and guarantees uniqueness in MongoDB.
   */
  async generateUniqueSlug(
    name: string,
    customSlug?: string,
    excludeId?: string,
  ): Promise<string> {
    const baseSlug = (customSlug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slugToUse = baseSlug || 'brand';
    let candidate = slugToUse;
    let counter = 1;

    while (true) {
      const query: any = { slug: candidate };
      if (excludeId && Types.ObjectId.isValid(excludeId)) {
        query._id = { $ne: new Types.ObjectId(excludeId) };
      }
      const existing = await this.brandModel.findOne(query).select('_id').lean();
      if (!existing) {
        return candidate;
      }
      candidate = `${slugToUse}-${counter}`;
      counter++;
    }
  }

  /**
   * Aggregate KPI stats for brands management overview
   */
  async getStats() {
    const [counts, countriesAgg] = await Promise.all([
      this.brandModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
            inactive: { $sum: { $cond: [{ $eq: ['$status', 'INACTIVE'] }, 1, 0] } },
            featured: { $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] } },
          },
        },
      ]),
      this.brandModel.aggregate([
        { $match: { countryOfOrigin: { $nin: ['', null] } } },
        { $group: { _id: '$countryOfOrigin', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const stats = counts[0] || { total: 0, active: 0, inactive: 0, featured: 0 };
    const topCountries = countriesAgg.map((item) => ({
      country: item._id,
      count: item.count,
    }));

    return {
      total: stats.total,
      active: stats.active,
      inactive: stats.inactive,
      featured: stats.featured,
      countriesCount: countriesAgg.length,
      topCountries,
    };
  }

  /**
   * Paginated list with filtering and search
   */
  async findAll(query: QueryBrandDto) {
    const {
      search,
      status = 'ALL',
      country,
      isFeatured,
      page = 1,
      limit = 20,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const filter: Record<string, any> = {};

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { countryOfOrigin: searchRegex },
        { description: searchRegex },
      ];
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (country && country.trim()) {
      filter.countryOfOrigin = country.trim();
    }

    if (typeof isFeatured === 'boolean') {
      filter.isFeatured = isFeatured;
    }

    const sortOptions: Record<string, 1 | -1> = {};
    const direction = sortOrder === 'desc' ? -1 : 1;
    sortOptions[sortBy] = direction;
    if (sortBy !== 'name') {
      sortOptions.name = 1;
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [items, total] = await Promise.all([
      this.brandModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.brandModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Find single brand by ID
   */
  async findOne(id: string): Promise<BrandDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid Brand ID format: ${id}`);
    }
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new NotFoundException(`Brand not found with ID: ${id}`);
    }
    return brand;
  }

  /**
   * Find single brand by slug
   */
  async findBySlug(slug: string): Promise<BrandDocument> {
    const brand = await this.brandModel.findOne({ slug: slug.toLowerCase().trim() });
    if (!brand) {
      throw new NotFoundException(`Brand not found with slug: ${slug}`);
    }
    return brand;
  }

  /**
   * Create a new brand
   */
  async create(dto: CreateBrandDto): Promise<BrandDocument> {
    const slug = await this.generateUniqueSlug(dto.name, dto.slug);

    const brand = new this.brandModel({
      ...dto,
      slug,
      seo: {
        metaTitle: dto.seo?.metaTitle || `${dto.name} Products & Official Store | ZYLO`,
        metaDescription:
          dto.seo?.metaDescription ||
          dto.description ||
          `Explore premier products from ${dto.name} with fast delivery and authentic guarantees at ZYLO.`,
        keywords: dto.seo?.keywords || [dto.name.toLowerCase(), 'official brand', 'zylo'],
        canonicalUrl: dto.seo?.canonicalUrl || `https://zylo.com/brands/${slug}`,
        ogImage: dto.seo?.ogImage || dto.logoUrl || null,
      },
    });

    return brand.save();
  }

  /**
   * Update existing brand
   */
  async update(id: string, dto: UpdateBrandDto): Promise<BrandDocument> {
    const brand = await this.findOne(id);

    if (dto.slug && dto.slug.trim() !== brand.slug) {
      const normalizedSlug = await this.generateUniqueSlug(brand.name, dto.slug, id);
      brand.slug = normalizedSlug;
    } else if (!brand.slug && dto.name) {
      brand.slug = await this.generateUniqueSlug(dto.name, undefined, id);
    }

    if (dto.name !== undefined) brand.name = dto.name.trim();
    if (dto.description !== undefined) brand.description = dto.description.trim();
    if (dto.logoUrl !== undefined) brand.logoUrl = dto.logoUrl;
    if (dto.bannerUrl !== undefined) brand.bannerUrl = dto.bannerUrl;
    if (dto.website !== undefined) brand.website = dto.website.trim();
    if (dto.countryOfOrigin !== undefined) brand.countryOfOrigin = dto.countryOfOrigin.trim();
    if (dto.isFeatured !== undefined) brand.isFeatured = dto.isFeatured;
    if (dto.status !== undefined) brand.status = dto.status;
    if (dto.displayOrder !== undefined) brand.displayOrder = dto.displayOrder;

    if (dto.seo) {
      brand.seo = {
        metaTitle: dto.seo.metaTitle ?? brand.seo?.metaTitle ?? '',
        metaDescription: dto.seo.metaDescription ?? brand.seo?.metaDescription ?? '',
        keywords: dto.seo.keywords ?? brand.seo?.keywords ?? [],
        canonicalUrl: dto.seo.canonicalUrl ?? brand.seo?.canonicalUrl ?? '',
        ogImage: dto.seo.ogImage !== undefined ? dto.seo.ogImage : brand.seo?.ogImage ?? null,
      };
    }

    return brand.save();
  }

  /**
   * Toggle brand status between ACTIVE and INACTIVE
   */
  async toggleStatus(id: string): Promise<BrandDocument> {
    const brand = await this.findOne(id);
    brand.status = brand.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return brand.save();
  }

  /**
   * Toggle featured flag
   */
  async toggleFeatured(id: string): Promise<BrandDocument> {
    const brand = await this.findOne(id);
    brand.isFeatured = !brand.isFeatured;
    return brand.save();
  }

  /**
   * Delete brand
   */
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const brand = await this.findOne(id);
    await this.brandModel.deleteOne({ _id: brand._id });
    return { success: true, message: `Brand '${brand.name}' successfully deleted.` };
  }

  /**
   * Public: List all active brands for storefront showcase
   */
  async getPublicBrands(): Promise<BrandDocument[]> {
    return this.brandModel
      .find({ status: 'ACTIVE' })
      .sort({ displayOrder: 1, name: 1 })
      .lean();
  }

  /**
   * Public: Featured brands
   */
  async getFeaturedBrands(): Promise<BrandDocument[]> {
    return this.brandModel
      .find({ status: 'ACTIVE', isFeatured: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();
  }
}
