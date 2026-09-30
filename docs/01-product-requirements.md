# Product Requirements Document (PRD)

## 1. Overview & Business Objectives
ZYLO is an end-to-end e-commerce solution enabling customers to browse, evaluate, and purchase products seamlessly while providing store managers with an administrative control plane for catalog management, stock replenishment, and order fulfillment.

---

## 2. Customer Facing Requirements

### 2.1 Authentication & Profile
- **Registration**: Email + password with password strength enforcement and email verification support.
- **Login / Logout**: JWT authentication with refresh token lifecycle. Single-click secure logout.
- **Password Management**: Forgot password flow sending secure one-time reset tokens; authenticated change password.
- **Address Book**:
  - Store multiple shipping addresses per customer.
  - Flag one address as `isDefault`.
  - Validate country, state, city, postal code, phone number.
- **Profile Management**: Update display name, phone, avatar image upload.

### 2.2 Product Discovery & Catalog
- **Navigation**: Hierarchical category tree (Categories → Subcategories) and Brand listings.
- **Search**: Keyword search across product title, description, SKU, and brand names.
- **Search Suggestions**: Typeahead auto-complete previewing top matched products and categories.
- **Faceted Filters**:
  - Category / Brand selection.
  - Price slider / range (Min / Max).
  - Availability toggle (In stock only).
  - Rating filter (4★ & above, etc.).
- **Sorting Options**:
  - `price_asc`: Lowest price first.
  - `price_desc`: Highest price first.
  - `newest`: Most recently added.
  - `rating`: Highest average customer rating.
  - `popularity`: Highest sales velocity.

### 2.3 Product Details Page (PDP)
- **Gallery**: Main high-resolution image viewer with thumbnail carousel and zoom.
- **Product Information**: Title, brand badge, SKU, category breadcrumbs, star ratings count.
- **Pricing & Discounts**: Original price (strikethrough) vs discounted selling price with calculation of % savings.
- **Variant Selection**: Interactive variant switcher (e.g., Size, Color) with instant stock update and dynamic price adjustment.
- **Stock Alert**: "In Stock", "Only X items left", or "Out of Stock" badge.
- **Action Buttons**: "Add to Cart" (with quantity selector) and "Buy Now" (instant redirect to checkout).
- **Related Products**: Showcase items belonging to the same category or brand.

### 2.4 Shopping Cart & Wishlist
- **Persistent Cart**: Synced with database for authenticated users; stored in LocalStorage for guest users and merged upon login.
- **Cart Management**: Real-time quantity adjustment, item removal, stock threshold enforcement.
- **Real-time Price Breakdown**: Line items subtotal, estimated shipping, applied coupon discount, tax calculation, grand total.
- **Wishlist**: Quick toggle to save favorite items; one-click "Move from Wishlist to Cart".

### 2.5 Checkout & Payment Flow
- **Step 1: Address Selection**: Pick existing saved address or enter a new shipping address.
- **Step 2: Shipping Method**: Standard delivery vs Express delivery options.
- **Step 3: Coupon Application**: Enter coupon code; backend verifies minimum spend, expiry, usage limit, and computes exact discount.
- **Step 4: Payment Selection**:
  - Cash on Delivery (COD).
  - Online Payment Gateway (e.g., Stripe or Razorpay test mode).
- **Order Placement**: Idempotent order creation with server-side stock lock.
- **Order Confirmation Page**: Detailed receipt, unique Order ID, estimated delivery date, direct link to invoice.

### 2.6 Order Tracking & Customer Service
- **Order History**: Paginated list of past orders with status badges and purchase timestamps.
- **Order Details**: Full itemized receipt, delivery address, tracking timeline, and downloadable PDF invoice.
- **Order Cancellation**: Allowed only while order status is in `PENDING` or `CONFIRMED`.
- **Product Reviews**: Verified buyers can submit star ratings (1–5) and written feedback with photo uploads after product delivery.

---

## 3. Administrative Portal Requirements

### 3.1 Operations Dashboard
- **Key Metrics (KPIs)**: Total Revenue, Gross Order Count, Active Customer Count, Total Catalog SKU Count.
- **Actionable Alerts**: Low-stock / Out-of-stock SKU list, Pending Fulfillment queue count.
- **Recent Activities**: Recent 10 orders with status and instant link to detail drawer.
- **Sales Analytics Visual**: Daily/weekly sales revenue and volume bar/line charts.

### 3.2 Catalog Management
- **Product CRUD**:
  - Rich text editor for product descriptions and technical specifications.
  - Image uploader with primary thumbnail selection and ordering.
  - SKU generation and barcode/identifier mapping.
  - Base price, sale price, cost price (margin tracking), tax class.
  - Variant matrix builder (attributes: Color, Size, Material).
  - Draft vs Published status toggle.
- **Category & Brand Management**:
  - Category creation with parent-child hierarchy, slug generator, and banner image.
  - Brand directory with logos and descriptions.

### 3.3 Inventory & Stock Control
- **Stock Tracking**: Total quantity on hand, reserved stock, available to sell.
- **Stock Movement Log**: Audit trail recording adjustments (`RESTOCK`, `ORDER_RESERVED`, `ORDER_FULFILLED`, `CANCELLED_RETURN`).
- **Low-Stock Threshold Settings**: Configurable alert triggers per SKU (e.g., alert when stock ≤ 5).

### 3.4 Order Processing Engine
- **Order Management List**: Filter by order status, date range, payment status, customer name.
- **Order State Progression**:
  - `PENDING` → `CONFIRMED` → `PROCESSING` → `PACKED` → `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED`
  - Cancellation & return handling (`CANCELLED`, `RETURNED`).
- **Shipping Integration Prep**: Input courier name, tracking number, and dispatch date.

### 3.5 Customer Oversight
- **Customer List**: Searchable directory showing total lifetime orders, spend value, registration date.
- **Account Actions**: Suspend / Deactivate account toggle, view associated shipping addresses.

### 3.6 Promotional Engine (Coupons)
- **Coupon Builder**:
  - Code string (e.g., `SAVE20`).
  - Discount type: `PERCENTAGE` or `FIXED_AMOUNT`.
  - Numeric value (e.g., 20% or $15).
  - Minimum cart spend requirement.
  - Maximum discount cap for percentage discounts.
  - Start date, expiration date, and total usage limits.
  - Active/Inactive switch.

### 3.7 Reviews Moderation
- Moderate customer reviews: View, Approve, Reject, or Delete spam/abusive entries.

---

## 4. Non-Functional Requirements
- **Performance**: P95 API response times < 200ms; client First Contentful Paint (FCP) < 1.2s.
- **Data Integrity**: MongoDB ACID transactions utilized for all multi-document operations (Checkout, Inventory decrement, Order state transitions).
- **Scalability**: Stateless backend design permitting horizontal scaling behind a reverse proxy.
- **Security**: Strict zero-trust input validation, CSRF protection, secure HTTP-only cookies for auth tokens.
