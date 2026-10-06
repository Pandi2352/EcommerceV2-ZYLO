# Module 4: Product Catalog Management — Architectural Plan

## 1. Overview & Objectives
The **Product Catalog** is the central backbone of the ZYLO eCommerce ecosystem. It unites the previously built and seeded **Categories** (35 seeded) and **Brands** (25 global seeded brands) with real-world inventory, pricing, media galleries, variant matrices, and search-optimized metadata.

This plan details the full end-to-end architecture across **Backend (NestJS)**, **Shared Library (`@zylo/shared`)**, and **Admin Console (`apps/admin`)** prior to writing code.

---

## 2. Core Feature Line Items (`line-items.md` Section 4)
- [ ] Product Data Model & Validation (Simple & Variant items)
- [ ] Auto-generated collision-proof product URL slugs (`slug.util.ts`)
- [ ] Auto-generated or custom unique SKUs (`ZYLO-{BRAND}-{RANDOM}`)
- [ ] Category & Brand association (Mongoose ObjectId references)
- [ ] Base price, sale price, cost price, and discount calculations
- [ ] Stock quantity, low-stock threshold alerts, and inventory status (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`)
- [ ] Multiple product image gallery with primary thumbnail selection and ordering
- [ ] Dynamic product specifications (Key-Value technical specs)
- [ ] Variant matrix creation (Color, Size, Storage with SKU, price, stock, and image per variant)
- [ ] Status lifecycle: `DRAFT`, `PUBLISHED`, `ARCHIVED`
- [ ] Featured spotlight flag and New Arrival badges
- [ ] Search Engine Optimization (SEO) preview, meta title/description, keywords
- [ ] Admin KPI Metrics (Total Products, Active/Published, Low Stock, Inventory Value)
- [ ] Seed script with 30+ real-world retail products from seeded brands (Apple, Sony, Nike, etc.)

---

## 3. Data Architecture (Backend)

### 3.1 MongoDB Schema (`server/src/modules/products/schemas/product.schema.ts`)
```typescript
export interface ProductImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductSpecification {
  group?: string; // e.g. "Technical", "Dimensions", "General"
  key: string;    // e.g. "Battery Life", "Weight", "Screen Size"
  value: string;  // e.g. "Up to 22 hours", "1.4 kg", "14.2 inches"
}

export interface ProductVariant {
  sku: string;
  title: string;                       // e.g. "Space Black / 512GB"
  price: number;
  salePrice?: number;
  stockQuantity: number;
  attributes: Record<string, string>;  // { "Color": "Space Black", "Storage": "512GB" }
  imageUrl?: string;
  isActive: boolean;
}

export class ProductDocument {
  // Identification
  name: string;
  slug: string; // unique index
  sku: string;  // unique index
  barcode?: string;
  description?: string;
  shortDescription?: string;

  // Taxonomy & Associations
  categoryId: Types.ObjectId; // ref: Category
  brandId: Types.ObjectId;    // ref: Brand
  tags: string[];

  // Pricing & Currency
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  currency: string; // default: "USD"

  // Inventory & Stock
  trackInventory: boolean; // default: true
  stockQuantity: number;
  lowStockThreshold: number; // default: 5
  allowBackorders: boolean;  // default: false

  // Media & Gallery
  images: ProductImage[];
  thumbnailUrl?: string;

  // Rich Attributes & Specs
  specifications: ProductSpecification[];

  // Variants
  hasVariants: boolean;
  variants: ProductVariant[];

  // Merchandising & Status
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  isNewArrival: boolean;
  ratingAverage: number; // 0.0 - 5.0
  ratingCount: number;

  // SEO (using shared Common SeoSchema)
  seo: SeoMetadata;

  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 DTOs (`server/src/modules/products/dto/`)
- `create-product.dto.ts`: Strict validation for prices (`@Min(0)`), SKU, taxonomy references, and optional variants.
- `update-product.dto.ts`: Partial updates with slug regeneration if name changed.
- `query-product.dto.ts`: Search, pagination (`page`, `limit`), filtering (`categoryId`, `brandId`, `status`, `minPrice`, `maxPrice`, `stockStatus`, `isFeatured`), sorting (`price:asc`, `price:desc`, `newest`, `popularity`).

### 3.3 RBAC Permissions
- `products.view`: View products in admin console
- `products.create`: Create new products and variants
- `products.edit`: Edit product details, pricing, and specs
- `products.delete`: Soft-delete or archive products
- `products.publish`: Toggle status between `DRAFT` and `PUBLISHED`

---

## 4. API Endpoints

### 4.1 Admin Controller (`/api/v1/admin/products`)
| Method | Endpoint | Description | Permission |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Paginated product list with search & multi-facet filters | `products.view` |
| `GET` | `/metrics` | KPI counts: Total, Published, Low Stock, Total Brands | `products.view` |
| `GET` | `/:id` | Full product document with populated category & brand | `products.view` |
| `POST` | `/` | Create product (auto-generates slug & SKU if empty) | `products.create` |
| `PATCH`| `/:id` | Update product fields and variants | `products.edit` |
| `PATCH`| `/:id/status` | Quick status change (`DRAFT` / `PUBLISHED` / `ARCHIVED`) | `products.publish` |
| `PATCH`| `/:id/featured`| Quick spotlight toggle | `products.edit` |
| `DELETE`| `/:id` | Soft-delete / Archive product | `products.delete` |

### 4.2 Public Storefront Controller (`/api/v1/products`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | List published products with customer filters & pagination |
| `GET` | `/featured` | Spotlight featured products |
| `GET` | `/:slug` | View single product details by slug with populated taxonomy |

---

## 5. Admin Frontend UI Design (`apps/admin`)

### 5.1 Main Products View (`apps/admin/src/pages/ProductsPage.tsx`)
1. **Header**: Title "Product Catalog", subtitle, "Export CSV", and primary action "+ Add Product".
2. **KPI Metrics Grid** (using reusable `KpiMetricsGrid`):
   - **Total Products** (Box icon / `FcPackage`)
   - **Published & Active** (Checkmark / `FcApproval`)
   - **Low Stock / Out of Stock** (Alert / `FcHighPriority`)
   - **Total Brands Represented** (Award / `FcSalesPerformance`)
3. **Filter Bar**:
   - Live Search (Title, SKU)
   - Category Dropdown filter (Populated from Categories API)
   - Brand Dropdown filter (Populated from Brands API)
   - Status Dropdown (`ALL`, `PUBLISHED`, `DRAFT`, `ARCHIVED`)
   - Stock Status Dropdown (`ALL`, `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`)
4. **Data Table**:
   - Product (Thumbnail, Title, SKU, Variants count badge)
   - Category & Brand tags
   - Price (Base price + Sale price strikethrough if on sale)
   - Stock (Quantity + Color-coded pill: Green for in stock, Amber for low stock, Red for out of stock)
   - Status badge (Published / Draft / Archived)
   - Featured star toggle
   - Row Actions (Edit, Delete)
5. **Pagination**: Right-aligned pagination bar with configurable page sizes (5, 10, 15, 20, 50).

### 5.2 Product Form Drawer (`apps/admin/src/components/products/ProductFormDrawer.tsx`)
Using our standardized **Pinned Drawer Architecture** (Pinned Header → Pinned Tabs via `headerExtra` with `no-scrollbar` & `overflow-y-hidden` → Scrollable Body → Sticky Footer):
- **Tab 1: General & Taxonomy**: Product Title, Slug (auto/manual), Brand selector (`Dropdown`), Category selector (`Dropdown`), Short Description, Long Description.
- **Tab 2: Pricing & Inventory**: Base Price, Sale Price, Cost Price, Currency, SKU, Barcode, Stock Quantity, Low-stock Alert Threshold, Track Inventory toggle.
- **Tab 3: Media Gallery**: Multiple Image URLs with Add/Remove, Preview thumbnails, and Radio selector for Primary Thumbnail.
- **Tab 4: Variants Matrix**: Toggle `Has Variants`. Option attributes (e.g. Size: S, M, L; Color: Black, Silver). Auto-generate or manually add variant rows with custom SKU, price, and stock quantity.
- **Tab 5: Specifications**: Dynamic Key-Value attribute table (e.g., Weight, Battery, Dimensions, Connectivity).
- **Tab 6: SEO & Social**: Meta Title (with character counter), Meta Description (with character counter), `TagInput` for Keywords, Canonical URL, and live `SeoSnippetPreview`.

---

## 6. Real-World Seed Data (`products-seed.service.ts`)
To immediately give the store life, seed 30+ premier products mapped to the 25 seeded brands:
- **Apple**: iPhone 16 Pro Max, MacBook Pro 16" M3 Max, Apple Watch Ultra 2, AirPods Pro 2
- **Sony**: WH-1000XM5 Headphones, PlayStation 5 Pro Console, Alpha A7 IV Camera
- **Samsung**: Galaxy S24 Ultra, 65" OLED 4K Smart TV, Odyssey Neo G9 Monitor
- **Nike**: Air Jordan 1 Retro, Pegasus 41 Running Shoes, Tech Fleece Hoodie
- **Adidas**: Ultraboost Light, Predator Elite Soccer Cleats
- **Dyson**: V15 Detect Cordless Vacuum, Supersonic Hair Dryer
- **Breville**: Barista Touch Espresso Machine
- **Rolex**: Submariner Date Watch
- **Lego**: Millennium Falcon Collector Set, Technic Ferrari Daytona
- **Razer**: Blade 16 Gaming Laptop, DeathAdder V3 Pro Mouse
- *(and more across Garmin, Sonos, Canon, Logitech)*

Each seeded product will include accurate pricing, high-resolution WebP/JPG images, variant options, rich technical specifications, and SEO metadata.

---

## 7. Implementation Steps Roadmap
1. **Phase 1: Backend Architecture**: Create `server/src/modules/products/` with Mongoose schemas, DTOs, service, admin controller, public controller, and register in `app.module.ts`.
2. **Phase 2: Product Seed Service**: Create `products-seed.service.ts` (30+ premier products) and auto-seed on database boot.
3. **Phase 3: Shared Types & API Client**: Define TypeScript interfaces in `packages/shared/src/types/product.ts` and API service in `packages/shared/src/api/products.service.ts`.
4. **Phase 4: Admin Products Page & KPI Metrics**: Add Products top-level menu in Admin Sidebar, create `ProductsPage.tsx`, metrics grid, filters, and data table.
5. **Phase 5: Product Form Drawer**: Implement `ProductFormDrawer.tsx` with all 6 tabs and delete confirmation modal.
6. **Phase 6: End-to-End Validation**: Verify in browser, test creating, editing, filtering, and searching products.
