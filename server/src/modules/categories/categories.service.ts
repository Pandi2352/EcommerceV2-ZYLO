import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument, CategoryAncestor } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

export interface CategoryTreeNode extends Omit<Category, 'ancestors'> {
  _id: string;
  ancestors: CategoryAncestor[];
  children: CategoryTreeNode[];
}

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * Generates a clean, URL-safe slug and guarantees uniqueness in MongoDB.
   */
  private async generateUniqueSlug(
    name: string,
    customSlug?: string,
    excludeId?: string,
  ): Promise<string> {
    const baseSlug = (customSlug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slugToUse = baseSlug || 'category';
    let candidate = slugToUse;
    let counter = 1;

    while (true) {
      const query: any = { slug: candidate };
      if (excludeId) {
        query._id = { $ne: new Types.ObjectId(excludeId) };
      }
      const existing = await this.categoryModel.findOne(query).select('_id').lean();
      if (!existing) {
        return candidate;
      }
      candidate = `${slugToUse}-${counter}`;
      counter++;
    }
  }

  /**
   * Recursively updates ancestors and level for all descendants of a category.
   */
  private async updateDescendants(parent: CategoryDocument): Promise<void> {
    const children = await this.categoryModel.find({ parentId: parent._id });
    for (const child of children) {
      const childAncestors: CategoryAncestor[] = [
        ...parent.ancestors,
        {
          _id: parent._id as Types.ObjectId,
          name: parent.name,
          slug: parent.slug,
          level: parent.level,
        },
      ];
      child.ancestors = childAncestors;
      child.level = parent.level + 1;
      await child.save();

      // Recurse down tree
      await this.updateDescendants(child);
    }
  }

  /**
   * Create a new category with materialized ancestors and level.
   */
  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const slug = await this.generateUniqueSlug(dto.name, dto.slug);

    let ancestors: CategoryAncestor[] = [];
    let level = 1;
    let parentDoc: CategoryDocument | null = null;

    if (dto.parentId) {
      if (!Types.ObjectId.isValid(dto.parentId)) {
        throw new BadRequestException('Invalid parentId format');
      }
      parentDoc = await this.categoryModel.findById(dto.parentId);
      if (!parentDoc) {
        throw new NotFoundException(`Parent category with ID ${dto.parentId} not found`);
      }

      ancestors = [
        ...parentDoc.ancestors,
        {
          _id: parentDoc._id as Types.ObjectId,
          name: parentDoc.name,
          slug: parentDoc.slug,
          level: parentDoc.level,
        },
      ];
      level = parentDoc.level + 1;
    }

    const createdCategory = new this.categoryModel({
      ...dto,
      slug,
      parentId: parentDoc ? parentDoc._id : null,
      ancestors,
      level,
      status: dto.status || 'ACTIVE',
      displayOrder: dto.displayOrder ?? 0,
      includeInMenu: dto.includeInMenu ?? true,
      isFeatured: dto.isFeatured ?? false,
      badge: dto.badge
        ? { text: dto.badge.text, color: dto.badge.color || 'indigo' }
        : null,
      filterableAttributes: dto.filterableAttributes || [],
      seo: {
        metaTitle: dto.seo?.metaTitle || dto.name,
        metaDescription: dto.seo?.metaDescription || dto.description || '',
        keywords: dto.seo?.keywords || [],
        canonicalUrl: dto.seo?.canonicalUrl || '',
        ogImage: dto.seo?.ogImage || dto.thumbnailUrl || null,
      },
    });

    const saved = await createdCategory.save();

    if (parentDoc) {
      await this.categoryModel.findByIdAndUpdate(parentDoc._id, {
        $inc: { subcategoryCount: 1 },
      });
    }

    return saved;
  }

  /**
   * Paginated listing of categories with search and multi-facet filters.
   */
  async findAll(query: QueryCategoryDto) {
    const {
      search,
      status,
      parentId,
      level,
      isFeatured,
      page = 1,
      limit = 20,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;

    const filter: any = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (parentId !== undefined && parentId !== '') {
      if (parentId === 'root' || parentId === 'null') {
        filter.parentId = null;
      } else if (Types.ObjectId.isValid(parentId)) {
        filter.parentId = new Types.ObjectId(parentId);
      }
    }

    if (level !== undefined && level > 0) {
      filter.level = level;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    if (sortBy !== 'name') {
      sortOptions.name = 1;
    }

    const [items, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('parentId', 'name slug')
        .lean(),
      this.categoryModel.countDocuments(filter),
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
   * Returns a complete nested tree structure of categories.
   */
  async getTree(status?: 'ACTIVE' | 'INACTIVE' | 'ALL'): Promise<CategoryTreeNode[]> {
    const filter: any = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const categories = await this.categoryModel
      .find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const nodeMap = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // Initialize map
    for (const cat of categories) {
      nodeMap.set((cat._id as Types.ObjectId).toString(), {
        ...cat,
        _id: (cat._id as Types.ObjectId).toString(),
        children: [],
      });
    }

    // Connect parents and children
    for (const cat of categories) {
      const catId = (cat._id as Types.ObjectId).toString();
      const node = nodeMap.get(catId)!;

      if (cat.parentId) {
        const parentNode = nodeMap.get(cat.parentId.toString());
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          // If parent was filtered out (e.g. inactive parent), treat as root in this view
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Aggregated dashboard metrics for category counts.
   */
  async getStats() {
    const [total, active, inactive, rootCount, subCount, featuredCount] = await Promise.all([
      this.categoryModel.countDocuments(),
      this.categoryModel.countDocuments({ status: 'ACTIVE' }),
      this.categoryModel.countDocuments({ status: 'INACTIVE' }),
      this.categoryModel.countDocuments({ level: 1 }),
      this.categoryModel.countDocuments({ level: { $gt: 1 } }),
      this.categoryModel.countDocuments({ isFeatured: true }),
    ]);

    return {
      total,
      active,
      inactive,
      rootCount,
      subCount,
      featuredCount,
    };
  }

  /**
   * Comprehensive aggregated overview data for Category Management Overview page.
   */
  async getOverview() {
    const categories: any[] = await this.categoryModel.find().lean().exec();

    const total = categories.length;
    let active = 0;
    let inactive = 0;
    let rootCount = 0;
    let level2Count = 0;
    let level3Count = 0;
    let featuredCount = 0;
    let menuCount = 0;
    let withBanners = 0;
    let withSeo = 0;
    let withBadges = 0;

    const rootCategories: Array<{
      id: string;
      name: string;
      slug: string;
      iconUrl: string | null;
      thumbnailUrl: string | null;
      status: string;
      isFeatured: boolean;
      badge: { text: string; color?: string } | null;
      childCount: number;
    }> = [];

    const rootMap = new Map<string, number>();

    for (const cat of categories) {
      if (cat.status === 'ACTIVE') active++;
      else inactive++;

      if (cat.level === 1) {
        rootCount++;
        rootMap.set(cat._id.toString(), 0);
      } else if (cat.level === 2) {
        level2Count++;
      } else if (cat.level >= 3) {
        level3Count++;
      }

      if (cat.isFeatured) featuredCount++;
      if (cat.includeInMenu) menuCount++;
      if (cat.bannerDesktopUrl && cat.bannerDesktopUrl.trim().length > 0) withBanners++;
      if (cat.seo?.metaTitle && cat.seo?.metaDescription) withSeo++;
      if (cat.badge?.text) withBadges++;
    }

    for (const cat of categories) {
      if (cat.level > 1 && cat.ancestors && cat.ancestors.length > 0) {
        const rootAncestorId = cat.ancestors[0]._id.toString();
        if (rootMap.has(rootAncestorId)) {
          rootMap.set(rootAncestorId, (rootMap.get(rootAncestorId) || 0) + 1);
        }
      }
    }

    for (const cat of categories) {
      if (cat.level === 1) {
        const idStr = cat._id.toString();
        rootCategories.push({
          id: idStr,
          name: cat.name,
          slug: cat.slug,
          iconUrl: cat.iconUrl || null,
          thumbnailUrl: cat.thumbnailUrl || null,
          status: cat.status,
          isFeatured: !!cat.isFeatured,
          badge: cat.badge || null,
          childCount: rootMap.get(idStr) || 0,
        });
      }
    }

    rootCategories.sort((a, b) => b.childCount - a.childCount);

    const attentionCategories = categories
      .filter((c) => !c.bannerDesktopUrl || !c.seo?.metaDescription || c.status === 'INACTIVE')
      .slice(0, 8)
      .map((c) => ({
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        level: c.level,
        status: c.status,
        missingBanner: !c.bannerDesktopUrl,
        missingSeo: !c.seo?.metaDescription,
      }));

    const recentCategories = [...categories]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6)
      .map((c) => ({
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        level: c.level,
        status: c.status,
        isFeatured: !!c.isFeatured,
        badge: c.badge || null,
        createdAt: c.createdAt,
      }));

    return {
      generatedAt: new Date().toISOString(),
      summary: {
        total,
        active,
        inactive,
        rootCount,
        subCount: level2Count + level3Count,
        featuredCount,
        menuCount,
        withBanners,
        withSeo,
        withBadges,
      },
      levelDistribution: [
        { level: 1, label: 'Root Departments (L1)', count: rootCount, color: 'var(--viz-1)' },
        { level: 2, label: 'Subcategories (L2)', count: level2Count, color: 'var(--viz-2)' },
        { level: 3, label: 'Leaf Collections (L3)', count: level3Count, color: 'var(--viz-3)' },
      ],
      departmentDistribution: rootCategories,
      merchandising: {
        featured: featuredCount,
        standard: total - featuredCount,
        inMenu: menuCount,
        catalogOnly: total - menuCount,
        withBadges,
        noBadges: total - withBadges,
      },
      health: {
        missingBanners: total - withBanners,
        missingSeo: total - withSeo,
        inactive,
        attentionCategories,
      },
      recentCategories,
    };
  }

  /**
   * Find single category by ID.
   */
  async findOne(id: string): Promise<CategoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID format');
    }

    const category = await this.categoryModel.findById(id).populate('parentId', 'name slug');
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Find single category by slug (for storefront category landing pages).
   */
  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel
      .findOne({ slug: slug.toLowerCase().trim() })
      .populate('parentId', 'name slug');

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  /**
   * Update category fields, with cycle prevention and ancestor propagation.
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    const category = await this.findOne(id);

    // Slug update or generation
    if (dto.name && dto.name !== category.name && !dto.slug) {
      category.name = dto.name;
    } else if (dto.name) {
      category.name = dto.name;
    }

    if (dto.slug && dto.slug !== category.slug) {
      category.slug = await this.generateUniqueSlug(dto.name || category.name, dto.slug, id);
    }

    // Check parent change & prevent cycles
    const oldParentId = category.parentId ? category.parentId.toString() : null;
    let newParentId: string | null = oldParentId;

    if (dto.parentId !== undefined) {
      newParentId = dto.parentId && dto.parentId !== 'root' ? dto.parentId : null;
    }

    if (newParentId !== oldParentId) {
      if (newParentId) {
        if (!Types.ObjectId.isValid(newParentId)) {
          throw new BadRequestException('Invalid parentId format');
        }
        if (newParentId === id) {
          throw new ConflictException('A category cannot be its own parent');
        }

        const newParent = await this.categoryModel.findById(newParentId);
        if (!newParent) {
          throw new NotFoundException(`Parent category with ID ${newParentId} not found`);
        }

        // Circular check: ensure newParent does not have current category in its ancestors
        const isDescendant = newParent.ancestors.some(
          (a) => a._id.toString() === id,
        );
        if (isDescendant) {
          throw new ConflictException(
            'Circular hierarchy detected: cannot set parent to a descendant category',
          );
        }

        category.parentId = newParent._id as Types.ObjectId;
        category.ancestors = [
          ...newParent.ancestors,
          {
            _id: newParent._id as Types.ObjectId,
            name: newParent.name,
            slug: newParent.slug,
            level: newParent.level,
          },
        ];
        category.level = newParent.level + 1;

        // Increment new parent subcategoryCount
        await this.categoryModel.findByIdAndUpdate(newParent._id, {
          $inc: { subcategoryCount: 1 },
        });
      } else {
        // Promoted to Root
        category.parentId = null;
        category.ancestors = [];
        category.level = 1;
      }

      // Decrement old parent subcategoryCount
      if (oldParentId) {
        await this.categoryModel.findByIdAndUpdate(oldParentId, {
          $inc: { subcategoryCount: -1 },
        });
      }
    }

    // Assign other scalar fields
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.iconUrl !== undefined) category.iconUrl = dto.iconUrl;
    if (dto.thumbnailUrl !== undefined) category.thumbnailUrl = dto.thumbnailUrl;
    if (dto.bannerDesktopUrl !== undefined) category.bannerDesktopUrl = dto.bannerDesktopUrl;
    if (dto.bannerMobileUrl !== undefined) category.bannerMobileUrl = dto.bannerMobileUrl;
    if (dto.imageAltText !== undefined) category.imageAltText = dto.imageAltText;
    if (dto.status !== undefined) category.status = dto.status;
    if (dto.displayOrder !== undefined) category.displayOrder = dto.displayOrder;
    if (dto.includeInMenu !== undefined) category.includeInMenu = dto.includeInMenu;
    if (dto.isFeatured !== undefined) category.isFeatured = dto.isFeatured;
    if (dto.badge !== undefined) {
      category.badge = dto.badge
        ? { text: dto.badge.text, color: dto.badge.color || 'indigo' }
        : null;
    }
    if (dto.filterableAttributes !== undefined) {
      category.filterableAttributes = dto.filterableAttributes;
    }

    if (dto.seo) {
      category.seo = {
        metaTitle: dto.seo.metaTitle ?? category.seo?.metaTitle ?? category.name,
        metaDescription: dto.seo.metaDescription ?? category.seo?.metaDescription ?? '',
        keywords: dto.seo.keywords ?? category.seo?.keywords ?? [],
        canonicalUrl: dto.seo.canonicalUrl ?? category.seo?.canonicalUrl ?? '',
        ogImage: dto.seo.ogImage ?? category.seo?.ogImage ?? category.thumbnailUrl ?? null,
      };
    }

    const saved = await category.save();

    // If parent changed or name/slug changed, update all descendants
    if (newParentId !== oldParentId || dto.name || dto.slug) {
      await this.updateDescendants(saved);
    }

    return saved;
  }

  /**
   * Toggle category status between ACTIVE and INACTIVE.
   */
  async toggleStatus(id: string): Promise<CategoryDocument> {
    const category = await this.findOne(id);
    category.status = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return category.save();
  }

  /**
   * Bulk reorder categories.
   */
  async reorder(dto: ReorderCategoriesDto): Promise<{ success: boolean; count: number }> {
    for (const item of dto.items) {
      const updateData: any = { displayOrder: item.displayOrder };
      if (item.parentId !== undefined) {
        updateData.parentId =
          item.parentId && item.parentId !== 'root'
            ? new Types.ObjectId(item.parentId)
            : null;
      }
      await this.categoryModel.findByIdAndUpdate(item.id, updateData);
    }

    return { success: true, count: dto.items.length };
  }

  /**
   * Safely delete category with orphan re-assignment support.
   */
  async remove(
    id: string,
    reassignToId?: string,
  ): Promise<{ success: boolean; message: string }> {
    const category = await this.findOne(id);

    const childCount = await this.categoryModel.countDocuments({ parentId: category._id });

    if (childCount > 0) {
      if (!reassignToId) {
        throw new BadRequestException(
          `Category has ${childCount} subcategories. Please reassign them to another category or root before deleting.`,
        );
      }

      if (reassignToId === id) {
        throw new BadRequestException('Cannot reassign subcategories to the category being deleted');
      }

      let newParentDoc: CategoryDocument | null = null;
      if (reassignToId !== 'root' && reassignToId !== 'null') {
        newParentDoc = await this.findOne(reassignToId);
      }

      const children = await this.categoryModel.find({ parentId: category._id });
      for (const child of children) {
        if (newParentDoc) {
          child.parentId = newParentDoc._id as Types.ObjectId;
          child.ancestors = [
            ...newParentDoc.ancestors,
            {
              _id: newParentDoc._id as Types.ObjectId,
              name: newParentDoc.name,
              slug: newParentDoc.slug,
              level: newParentDoc.level,
            },
          ];
          child.level = newParentDoc.level + 1;
        } else {
          // Reassigned to root
          child.parentId = null;
          child.ancestors = [];
          child.level = 1;
        }
        await child.save();
        await this.updateDescendants(child);
      }

      if (newParentDoc) {
        await this.categoryModel.findByIdAndUpdate(newParentDoc._id, {
          $inc: { subcategoryCount: childCount },
        });
      }
    }

    // Decrement parent subcategoryCount if had parent
    if (category.parentId) {
      await this.categoryModel.findByIdAndUpdate(category.parentId, {
        $inc: { subcategoryCount: -1 },
      });
    }

    await this.categoryModel.findByIdAndDelete(id);

    return {
      success: true,
      message: `Category "${category.name}" successfully deleted.`,
    };
  }
}
