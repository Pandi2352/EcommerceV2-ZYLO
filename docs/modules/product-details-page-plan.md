# Module 6 — Product Details Page (PDP) Implementation Plan

## 1. Overview & Objectives
The **Product Details Page (PDP)** is the primary conversion hub of the ZYLO storefront. When a customer navigates from the homepage, search suggestions, or the `/shop` discovery grid, they land on `/products/:slug`. This module delivers a high-fidelity, high-conversion retail product experience matching the established ZYLO aesthetic: zero box shadows (`shadow-none`), uniform `rounded-md` geometry, crisp slate borders, amber accents (`#f59e0b`), and instant interactivity.

---

## 2. Line Items Checklist (from `line-items.md`)
- [ ] Product image gallery with zoom viewer
- [ ] Multi-angle image thumbnail carousel with active states
- [ ] Product title, brand link with badge, and category breadcrumb trail
- [ ] Star rating and review count summary
- [ ] Dynamic pricing display (Base price vs Sale price)
- [ ] Calculated percentage savings badge (`Save $X (Y%)`)
- [ ] Interactive variant selection (attributes like Size, Color, Storage)
- [ ] Dynamic SKU, price, and stock updates on variant change
- [ ] Real-time stock status badge ("In Stock", "Only X left", "Out of Stock")
- [ ] Quantity stepper with live inventory boundary validation
- [ ] "Add to Cart" action with toast feedback
- [ ] "Buy Now" instant checkout action
- [ ] "Add to Wishlist" toggle button
- [ ] Tabbed technical specifications table and rich content
- [ ] Related products recommendation carousel

---

## 3. Backend Enhancements (`server`)

### 3.1 Related Products API Endpoint
- **Controller**: Add `@Get(':slug/related')` before `@Get(':slug')` in `public-products.controller.ts`.
- **Service Method**: `getRelatedProducts(slug: string, limit = 6)`:
  - Finds the target product by slug.
  - Queries published products matching `categoryId: product.categoryId` (or fallback to `brandId`) where `_id !== product._id`.
  - Populates `categoryId` and `brandId`.
  - Returns up to `limit` items.

---

## 4. Shared API Client & Types (`packages/shared`)

### 4.1 Client Method
- Extend `productsService` with:
  ```ts
  getRelated: (slug: string, limit?: number) =>
    unwrap<ProductItem[]>(api.get(`/products/${slug}/related`, { params: { limit } })),
  ```

---

## 5. Storefront Frontend Architecture (`apps/storefront`)

### 5.1 Route Mapping
- Route paths:
  - Canonical: `/products/:slug`
  - Alias / backwards compatible: `/product/:slug` and `/product/:id`
- Remove `PRODUCT_DETAILS` from `CUSTOMER_PUBLIC_PLANNED` in `plannedRoutes.ts`.
- Wire `ProductDetailsPage` into `AppRoutes.tsx` under `<CustomerLayout showRail={false} />`.

### 5.2 PDP Components Directory Structure (`src/features/pdp/`)
1. **`hooks/useProductDetails.ts`**:
   - Manages fetching product data by `slug` using `useParams()`.
   - Manages fetching related products.
   - Manages selected variant (if product has variants).
   - Computes effective price, effective stock, SKU, and discount percentages based on active variant or base product.
   - Manages active gallery image index and hover zoom coordinates.
   - Manages cart quantity selection.
   - Manages active tab state (`overview`, `specs`, `shipping`, `reviews`).

2. **`components/ProductImageGallery.tsx`**:
   - Large image display area with lens-zoom or pan preview on hover.
   - Badges overlay: Sale -X% off, New Arrival, Featured.
   - Horizontal thumbnail strip with active border indicator (`border-amber-500`).
   - Image fallback gracefully handling broken links.

3. **`components/ProductHeaderMeta.tsx`**:
   - Breadcrumb navigation: `Home > Shop > [Category] > [Product Name]`.
   - Brand name chip linking to `/shop?brandIds=[brandId]`.
   - Product title (`h1`).
   - Customer ratings: 5-star visual representation, numerical rating, review count, and SKU badge.

4. **`components/ProductPriceAndBadges.tsx`**:
   - Prominent price formatting (`$X.XX`).
   - Strikethrough original price when discounted.
   - Savings badge: `Save $X.XX (-Y%)`.
   - Inclusive tax / currency notice.

5. **`components/ProductVariantSelector.tsx`**:
   - Groups variants by attributes (e.g., Color, Size, Storage).
   - Selectable pills with active amber styling.
   - Out-of-stock strike-through for unavailable variants.

6. **`components/ProductPurchaseCard.tsx`**:
   - Live stock indicator with color-coded alerts:
     - Green: `In Stock (X units available)`
     - Amber: `Only X left in stock — order soon`
     - Red: `Currently Out of Stock`
   - Quantity selector with `-` and `+` buttons capped by available stock.
   - Action buttons:
     - `Add to Cart` (Primary Navy `#2A3B5C`, ShoppingBag icon)
     - `Buy Now` (Amber `#f59e0b`, Zap / ArrowRight icon)
     - `Wishlist` (Ghost icon button with Heart toggle)
   - Trust and guarantees bar: Free delivery over $50, 30-day risk-free return, 1-year official brand warranty.

7. **`components/ProductTabsSection.tsx`**:
   - Tab 1: **Description & Highlights** (Key features bullets, rich description).
   - Tab 2: **Technical Specifications** (Structured 2-column key-value table).
   - Tab 3: **Shipping & Delivery** (Estimated delivery windows, return process).
   - Tab 4: **Customer Reviews** (Rating distribution bars, customer feedback snippets).

8. **`components/RelatedProductsCarousel.tsx`**:
   - Clean horizontal grid/carousel of related items.
   - Reuses `ProductCard` from `features/shop`.

---

## 6. Verification & Quality Gates
1. Typecheck: `npx tsc --noEmit` across `packages/shared`, `server`, and `apps/storefront`.
2. Browser subagent testing:
   - Navigate to `/products/:slug` from `/shop`.
   - Test thumbnail switching in gallery.
   - Test variant selection updating price and SKU.
   - Test quantity stepper and Add to Cart toast.
   - Verify specs table and related recommendations render properly.
3. Update `line-items.md` Section 6 to completed.
