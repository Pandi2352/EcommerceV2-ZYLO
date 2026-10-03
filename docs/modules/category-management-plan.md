# Comprehensive Architecture & Implementation Plan: E-Commerce Category Management

## 1. Executive Vision & Objectives
The Category Management module serves as the primary navigation backbone and merchandising engine for both the **Admin Console** and the **Customer Storefront**. 

Drawing best practices from leading platforms (**Shopify Collections**, **MedusaJS**, and **Saleor Category/Attribute Trees**), this system is engineered for:
1. **Infinite-Depth Hierarchy with Sub-Millisecond Traversal**: Parent-child nesting with materialized path/ancestors array to eliminate recursive database queries.
2. **Dynamic Faceted Attributes**: Categories define product attribute templates (e.g., Electronics ➔ RAM, Storage, Voltage; Apparel ➔ Size, Material, Fit) that drive storefront search filters.
3. **Omnichannel Merchandising**: Desktop/mobile hero banners, promotional badges ("NEW", "50% OFF"), mega-menu display controls, and homepage featured flags.
4. **Autonomous SEO Engine**: Real-time Google SERP preview, OpenGraph social sharing tags, canonical URLs, and automated Schema.org `BreadcrumbList` & `ItemList` JSON-LD.
5. **Ultra-Clean Modern Admin UI/UX**: Zero-shadow aesthetic, uniform `rounded-md` standard, vibrant `react-icons/fc` count cards, scoped outlet `ApiLoader`, and dual **Interactive Visual Tree** + **Tabular Data** views.

---

## 2. Full Feature Breakdown

### A. Core Hierarchy & Taxonomy
- **Multi-Level Parent-Child Tree**: Unlimited nesting depth with level indicators (Level 1 Root, Level 2 Subcategory, Level 3 Child, etc.).
- **Materialized Ancestors Path**: Each node stores `{ id, name, slug }` of all parent ancestors for immediate breadcrumb generation without recursive DB lookups.
- **Circular Reference Safeguard**: Backend validation strictly prevents assigning a category as its own parent or descending under its own children.
- **Smart URL Slugs**: Auto-generated slug from category name with manual override and automatic collision resolution.

### B. Media & Visual Merchandising
- **Category Icon**: SVG or compact icon (32x32) for navigation menus and pill chips.
- **Thumbnail Image**: Square card preview (400x400) for grid catalogs and mobile menus.
- **Desktop Hero Banner**: Wide panoramic banner (1920x400) displayed on the Storefront Category Landing Page.
- **Mobile Hero Banner**: Aspect-optimized banner (800x400) for mobile touchscreens.
- **Accessible Alt Tags**: Dedicated descriptive text for SEO and screen-readers.

### C. Display & Navigation Controls
- **Display Order (`displayOrder`)**: Numerical ordering index for custom storefront sorting.
- **Show in Main Navigation (Mega Menu)**: Toggle whether category appears in the top navigation header.
- **Featured on Homepage**: Toggle whether category appears in the homepage carousel/curated collections.
- **Promotional Badge**: Optional text (e.g., `HOT`, `TRENDING`, `UP TO 40% OFF`) with customizable tone (`indigo`, `emerald`, `amber`, `rose`).
- **Status Lifecycle**: `ACTIVE` (visible across storefront) vs `INACTIVE` (hidden from storefront navigation, drafts preserved).

### D. Category-Specific Product Filter Facets
- Assign applicable attribute sets to each category (e.g., *Brand, Size, Color, Connectivity, Material*).
- When browsing this category on the storefront, the faceted search sidebar dynamically renders these exact filters.

### E. Advanced SEO & Social Sharing
- **Meta Title** with live character counter (recommended 50–60 chars).
- **Meta Description** with live character counter (recommended 150–160 chars).
- **Focus Keywords**: Comma-separated search indexing tags.
- **Canonical URL**: Custom canonical override to prevent duplicate content penalties.
- **Live Google Search Preview**: Interactive desktop/mobile Google SERP card snippet preview.
- **OpenGraph & Twitter Card**: Social title, description, and social share image preview.

### F. Product Tracking & Safe Deletion
- **Live Counter Aggregation**: Tracks Total Products, Active Products, and Direct Subcategories.
- **Deletion Safety Modal**:
  - If a category contains subcategories or products, deletion is blocked unless the admin chooses:
    1. **Reassign Products & Children**: Move all products and subcategories to a selected parent or alternative category.
    2. **Unpublish / Set Inactive**: Keep products but hide the category structure.

---

## 3. Database Schema Design (Mongoose)

```typescript
// server/src/modules/categories/schemas/category.schema.ts

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ type: String, trim: true, default: '' })
  description: string;

  // Parent reference (null for Root categories)
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null, index: true })
  parentId: Types.ObjectId | null;

  // Materialized path of ancestors for instantaneous breadcrumb rendering
  @Prop({
    type: [{
      _id: { type: Types.ObjectId, ref: 'Category' },
      name: String,
      slug: String,
      level: Number,
    }],
    default: [],
  })
  ancestors: Array<{ _id: Types.ObjectId; name: string; slug: string; level: number }>;

  @Prop({ type: Number, default: 1 })
  level: number; // 1 = Root, 2 = Subcategory, 3 = Leaf, etc.

  // Media assets
  @Prop({ type: String, default: null })
  iconUrl: string | null;

  @Prop({ type: String, default: null })
  thumbnailUrl: string | null;

  @Prop({ type: String, default: null })
  bannerDesktopUrl: string | null;

  @Prop({ type: String, default: null })
  bannerMobileUrl: string | null;

  @Prop({ type: String, default: '' })
  imageAltText: string;

  // Merchandising & Navigation
  @Prop({ type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true })
  status: 'ACTIVE' | 'INACTIVE';

  @Prop({ type: Number, default: 0, index: true })
  displayOrder: number;

  @Prop({ type: Boolean, default: true })
  includeInMenu: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({
    type: {
      text: { type: String, default: '' },
      color: { type: String, default: 'indigo' }, // indigo, emerald, amber, rose
    },
    default: null,
  })
  badge: { text: string; color: string } | null;

  // Filter Facets (assigned attribute keys)
  @Prop({ type: [String], default: [] })
  filterableAttributes: string[]; // e.g. ['brand', 'color', 'size', 'ram']

  // SEO Metadata
  @Prop({
    type: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: [String], default: [] },
      canonicalUrl: { type: String, default: '' },
      ogImage: { type: String, default: null },
    },
    default: {},
  })
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
    ogImage: string | null;
  };

  // Denormalized counters for lightning-fast listings
  @Prop({ type: Number, default: 0 })
  productCount: number;

  @Prop({ type: Number, default: 0 })
  activeProductCount: number;

  @Prop({ type: Number, default: 0 })
  subcategoryCount: number;
}

// Compound Indexes for fast sorting and filtering
CategorySchema.index({ status: 1, displayOrder: 1 });
CategorySchema.index({ parentId: 1, displayOrder: 1 });
CategorySchema.index({ 'ancestors._id': 1 });
```

---

## 4. REST API Endpoint Specification

All endpoints are guarded by JWT Auth, Dual-Portal check, and Granular RBAC Permissions:

| Method | Endpoint | Description | Permission Guard |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Paginated/flat list with query filters (`q`, `status`, `parentId`, `level`) | `categories.view` |
| `GET` | `/api/v1/categories/tree` | Full nested hierarchical tree data structure for menus and tree UI | `categories.view` / Public |
| `GET` | `/api/v1/categories/stats` | Aggregated metrics (Total, Root, Subcategories, Active, Featured) | `categories.view` |
| `GET` | `/api/v1/categories/:id` | Single category details with ancestors and direct subcategories | `categories.view` |
| `POST` | `/api/v1/categories` | Create new category (validates unique slug & ancestor tree) | `categories.create` |
| `PATCH` | `/api/v1/categories/:id` | Update category details, media, SEO, or parent hierarchy | `categories.edit` |
| `PATCH` | `/api/v1/categories/:id/status` | Quick toggle between `ACTIVE` and `INACTIVE` | `categories.edit` |
| `PUT` | `/api/v1/categories/reorder` | Bulk batch update `displayOrder` and `parentId` | `categories.edit` |
| `DELETE` | `/api/v1/categories/:id` | Delete category with orphan re-assignment check | `categories.delete` |

---

## 5. Modern UI/UX Admin Interface Design

Aligned with our strict design standards: **zero shadows (`shadow-none`)**, **`rounded-md` everywhere**, **vibrant `react-icons/fc` metrics**, and **outlet-scoped `ApiLoader`**.

### Page Layout: `/categories`

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Categories Directory                                          [ Refresh ]  [+ New Category] │
│ Organize hierarchical catalog taxonomy, navigation menus, hero banners, and SEO filters.│
└────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ [FcFolder]       │ │ [FcTreeStructure]│ │ [FcOk]           │ │ [FcOpenedFolder] │
│ Total Categories │ │ Root Categories  │ │ Active Live      │ │ Featured on Home │
│ 28               │ │ 6                │ │ 26               │ │ 8                │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [ Search categories... ]  [ All Levels v ]  [ All Statuses v ]  │  [ Tree View ] [ Table ] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ▼ [Icon] Electronics & Gadgets (Level 1)   • 142 Products  • Active   [+ Sub] [Edit] [:] │
│   ├── [Icon] Smartphones & Tablets (Level 2) • 86 Products • Active   [+ Sub] [Edit] [:] │
│   │   ├── iOS Devices (Level 3)              • 34 Products • Active   [+ Sub] [Edit] [:] │
│   │   └── Android Devices (Level 3)          • 52 Products • Active   [+ Sub] [Edit] [:] │
│   └── [Icon] Audio & Headphones (Level 2)    • 56 Products • Active   [+ Sub] [Edit] [:] │
│ ▶ [Icon] Fashion & Apparel (Level 1)       • 310 Products  • Active   [+ Sub] [Edit] [:] │
│ ▶ [Icon] Home & Kitchen (Level 1)          • 95 Products   • Active   [+ Sub] [Edit] [:] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Tabbed Slide-Over Drawer: Create / Edit Category (`Drawer size="lg"`)
- **Tab 1: General & Hierarchy**:
  - Category Name, Auto-generated Slug with editable preview.
  - Parent Category Picker: Searchable dropdown listing all categories with hierarchy indentation (`None (Root Category)`, `Electronics`, `└── Smartphones`).
  - Rich Description textarea.
- **Tab 2: Media & Assets**:
  - Icon URL / Upload (SVG/PNG).
  - Thumbnail preview box (`w-24 h-24 rounded-md border border-slate-200`).
  - Wide Desktop Banner (1920x400 preview) & Mobile Banner (800x400 preview).
  - Image Alt Text input.
- **Tab 3: Merchandising & Navigation**:
  - Display Order index number.
  - Switches: `Include in Mega Menu`, `Feature on Homepage`, `Active Status`.
  - Promotional Badge configuration: Text (e.g. `UP TO 40% OFF`) and Tone selector (`indigo`, `emerald`, `amber`, `rose`).
- **Tab 4: Search Engine Optimization (SEO)**:
  - Meta Title (with character meter `0 / 60`).
  - Meta Description (with character meter `0 / 160`).
  - Focus Keywords tag input.
  - Canonical URL.
  - **Live Google Search Snippet Preview**: Renders real-time mockup of how Google search results will appear on desktop and mobile.
- **Tab 5: Filter Facets**:
  - Checkbox chips for filterable product attributes (`brand`, `color`, `size`, `ram`, `storage`, `material`, `gender`).

---

## 6. Implementation Sequence

### Step 1: Backend Categories Module
1. Create `server/src/modules/categories/schemas/category.schema.ts`.
2. Create DTOs (`create-category.dto.ts`, `update-category.dto.ts`, `query-category.dto.ts`, `reorder-categories.dto.ts`) with `class-validator`.
3. Implement `categories.service.ts`:
   - Slug generator with uniqueness check.
   - Materialized ancestor recalculation on parent change.
   - Circular reference detector.
   - Nested tree builder for navigation.
   - Safe deletion handler with re-assignment support.
4. Implement `categories.controller.ts` with Swagger documentation and `@RequirePermissions(...)` guards.
5. Register `CategoriesModule` in `app.module.ts`.

### Step 2: Shared Types & API Client
1. Add `Category`, `CategoryTreeItem`, and DTO types to `@shared/types/catalog.ts`.
2. Add `categoriesService` to `@shared/api/categories.service.ts`.

### Step 3: Admin Category Management UI
1. Create `CategoriesPage.tsx` with:
   - 4 Count Cards (`FcFolder`, `FcTreeStructure`, `FcOk`, `FcOpenedFolder`).
   - Dual view toggle (Interactive Tree vs Data Table).
   - Search & filters.
   - Status toggle & Safe Delete Dialog.
2. Build `CategoryFormDrawer.tsx` (Tabbed Create/Edit drawer).
3. Connect into Admin routing (`/categories`) with RBAC guard `categories.view`.
4. Update Admin Sidebar navigation with category icon and badges.

### Step 4: Verification & Quality Assurance
1. Test nesting: Create Root ➔ Subcategory ➔ Child leaf.
2. Test circular reference rejection (e.g. attempting to assign Root as a child of its own subcategory).
3. Test safe deletion modal (verify product re-assignment prompt).
4. Run `npm run build` across `@zylo/admin` and `server` with 0 TypeScript errors.
