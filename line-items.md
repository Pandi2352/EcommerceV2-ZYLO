# E-Commerce Project — Module-Wise Line Items Checklist

## 1. Authentication & Authorization
### Customer Authentication
- [x] User registration (Email, password, name)
- [x] Email format & strong password validation (Min 8 chars, 1 uppercase, 1 number, 1 symbol)
- [x] Password strength indicator meter on registration UI
- [x] Password visibility toggle (Show / Hide password)
- [x] User login with email and password
- [x] "Remember me" option on login (Adjusts cookie duration)
- [x] User logout (Cookie clearance & server-side token invalidation)
- [x] Current authenticated user endpoint (`GET /api/v1/auth/me`)
- [x] Client auth state initialization on app load / page refresh
- [x] Protected route wrapper for customer accounts (`ProtectedRoute`)
- [x] Auto-redirect to previously attempted URL after login

### Email Verification & Password Recovery
- [x] Email verification token generation on registration
- [x] Email verification confirmation endpoint (`GET /api/v1/auth/verify-email?token=...`)
- [x] Resend email verification link endpoint
- [x] Forgot password request (Generates 1-hour expiry hash token)
- [x] Password reset token delivery via email
- [x] Reset password submission with token validation
- [x] Change password for authenticated users (Verifies current old password)
- [x] Prevent reusing the immediate old password

### Security, Session & Token Lifecycle
- [x] Dual-token scheme: Short-lived access token (15 min) + Long-lived refresh token (7 days)
- [x] Secure cookie configuration (`httpOnly: true`, `secure: true`, `sameSite: 'lax'`)
- [x] Silent token refresh endpoint (`POST /api/v1/auth/refresh`)
- [x] Axios response interceptor for transparent 401 token refresh and request retry
- [x] Refresh token rotation (Issues a fresh refresh token on every refresh call)
- [x] Refresh token reuse detection (Revokes entire token family if stolen token is replayed)
- [x] Logout from all active sessions / devices (Revokes all user refresh tokens)
- [x] Brute-force rate limiting on auth endpoints (Max 5 attempts per min per IP via Throttler)
- [x] Account temporary lockout / cooldown after 5 consecutive failed login attempts
- [x] Password hashing with `bcryptjs` / `argon2` (Salt rounds: 12)

### Social Authentication (OAuth2)
- [x] Google OAuth2 registration and login (`passport-google-oauth20`)
- [x] Social account linking with existing email account
- [x] OAuth2 redirect callback handler and auth cookie issuance

### Admin Authentication & RBAC
- [x] Dedicated Admin login endpoint
- [x] Admin profile view & session check
- [x] NestJS `JwtAuthGuard` and `RolesGuard` integration
- [x] `@Roles('ADMIN')` decorator enforcing endpoint permissions
- [x] Role hierarchy support (`SUPER_ADMIN`, `ADMIN`, `SUPPORT_AGENT`)
- [x] Admin protected route wrapper (`AdminRoute`)
- [x] Admin login audit log (Records timestamp, IP address, and user-agent)
- [x] Force password reset on first initial admin login

### Staff User Management & Granular RBAC (Admin)
- [x] Staff Directory with search, status filter, role filter, and server-side pagination (`/users`)
- [x] Staff account status toggling (Active vs Suspended) with instant session revocation
- [x] Staff account soft deletion
- [x] Staff password reset link generation and email dispatch
- [x] Staff User Profile Details (`/users/:id`) with effective permissions, assigned roles, and activity
- [x] Staff Invitations management (`/invitations`) with tokenized onboarding links
- [x] Invitation token rotation / resend capabilities
- [x] Invitation revocation and expiration tracking
- [x] Invitation acceptance & onboarding flow (`/accept-invite`)
- [x] Dynamic Roles & Permissions catalog (`/roles`)
- [x] Custom role creation with permission cloning option
- [x] Granular Permissions Matrix (`/roles/:id`) grouped by system domains and modules
- [x] Quick module permission actions (Select All, View Only, Clear)
- [x] Permission Diff Review modal before saving role changes
- [x] Login Activity Audit Trail (`/login-activity`) tracking IPs, devices, browsers, and events
- [x] Remote session revocation per user from login activity log
- [x] Fine-grained permission guards (`@RequirePermissions(...)`, `PermissionsGuard`, frontend route guards)

### Multi-Factor Authentication (MFA / 2FA — Advanced / Optional)
- [x] TOTP 2FA secret generation & QR code display (Google Authenticator)
- [x] 2FA code verification on login
- [x] Downloadable 2FA one-time emergency backup recovery codes

---

## 2. Customer Account & Address Book
- [ ] View account profile
- [ ] Update profile details (Name, phone, avatar)
- [x] Change password (Authenticated)
- [ ] View saved addresses list
- [ ] Add new shipping address
- [ ] Edit existing address
- [ ] Delete address
- [ ] Set default shipping address
- [ ] Address validation (City, state, postal code, phone)

---

## 3. Categories & Brands
### Categories
- [x] List all active categories (Storefront & Admin)
- [x] View single category details & slug routing
- [x] Hierarchical parent-child category tree (Subcategories with 3+ depth levels)
- [x] Auto-generate collision-proof URL slugs with manual override
- [x] Category desktop/mobile banners, square thumbnail, and SVG icon imagery
- [x] Admin: Create category (Multi-tab drawer: General, Media, Merchandising, SEO, Facets)
- [x] Admin: Edit category with cycle-preventing parent re-assignment
- [x] Admin: Safely delete category with orphan subcategory re-assignment selector
- [x] Admin: Toggle category active/inactive visibility status
- [x] Admin: Interactive Visual Tree view with expand/collapse and Move Up/Down reordering
- [x] Admin: Flat Table view with sorting, status indicators, and configurable pagination (5, 10, 15, 20, 50 rows per page) with right-aligned navigation controls
- [x] Admin: Dedicated top-level Categories menu in admin sidebar with Overview & Taxonomy submenus
- [x] Admin: Category Management Overview page with 6 KPI count cards (Flat color icons), department distribution bar charts, hierarchy depth distribution, storefront merchandising breakdown, and SEO quality audit cards
- [x] Admin: 35 high-fidelity retail categories seeded across 10 root departments with multi-level hierarchies, complete imagery, badges, and SEO metadata

### Brands
- [ ] List all active brands
- [ ] View brand details
- [ ] Brand logo upload
- [ ] Admin: Create brand
- [ ] Admin: Edit brand
- [ ] Admin: Delete brand
- [ ] Admin: Toggle brand active/inactive status

---

## 4. Product Catalog Management (Admin)
- [ ] Create new product
- [ ] Edit existing product
- [ ] Soft-delete / Unpublish product
- [ ] Product title, description, rich text specs
- [ ] Auto-generate unique product slug
- [ ] Assign category and brand
- [ ] SKU generation and assignment
- [ ] Base price and discount price setup
- [ ] Stock quantity tracking
- [ ] Multiple product image upload
- [ ] Set primary/thumbnail image
- [ ] Image reordering and deletion
- [ ] Product attribute setup (Color, Size, Material)
- [ ] Variant matrix creation (SKU, title, price, stock per variant)
- [ ] Featured product flag toggle
- [ ] Publish / Draft status toggle

---

## 5. Product Discovery, Search & Filtering (Customer)
- [ ] Keyword search across product name and description
- [ ] Search suggestions / Typeahead dropdown
- [ ] Filter by category (single & multi-select)
- [ ] Filter by brand
- [ ] Filter by price range (Min/Max slider)
- [ ] Filter by stock availability ("In Stock" toggle)
- [ ] Filter by customer rating (e.g. 4★ & above)
- [ ] Sort by Price: Low to High
- [ ] Sort by Price: High to Low
- [ ] Sort by Newest arrivals
- [ ] Sort by Top rated
- [ ] Sort by Popularity / Best sellers
- [ ] Server-side pagination (Page, limit, total count)
- [ ] Active filter chips with one-click clear

---

## 6. Product Details Page (PDP)
- [ ] Product image gallery with zoom
- [ ] Image thumbnail carousel
- [ ] Product title, brand link, and category breadcrumbs
- [ ] Star rating and review count summary
- [ ] Real-time price display (Original vs Discount price)
- [ ] Percentage savings badge
- [ ] Variant selection (Size, Color pills)
- [ ] Dynamic SKU and price update on variant change
- [ ] Real-time stock status badge ("In Stock", "Only X left", "Out of Stock")
- [ ] Quantity selector
- [ ] Add to Cart button
- [ ] Buy Now button (Instant checkout redirect)
- [ ] Add to Wishlist toggle button
- [ ] Product technical specifications table
- [ ] Related products recommendation carousel

---

## 7. Shopping Cart
- [ ] Add item to cart (Product ID, Variant ID, Quantity)
- [ ] Real-time stock limit validation on add
- [ ] View cart items with thumbnails and variant titles
- [ ] Increment item quantity
- [ ] Decrement item quantity
- [ ] Remove item from cart
- [ ] Clear entire cart
- [ ] Persistent cart for authenticated users
- [ ] Local storage cart for guest shoppers
- [ ] Merge guest cart items into user cart upon login
- [ ] Real-time server-side price calculation
- [ ] Cart subtotal calculation
- [ ] Free shipping progress indicator / threshold calculation
- [ ] Estimated shipping fee calculation
- [ ] Tax calculation
- [ ] Cart grand total calculation
- [ ] Apply promotional coupon code
- [ ] Remove applied coupon code
- [ ] Cart slide-over drawer UI
- [ ] Dedicated full cart page UI
- [ ] Empty cart state with "Shop Now" call to action

---

## 8. Wishlist
- [ ] Add item to wishlist
- [ ] Remove item from wishlist
- [ ] View all wishlist items
- [ ] Move single item from wishlist to cart
- [ ] Move all wishlist items to cart
- [ ] Empty wishlist state

---

## 9. Checkout Workflow
- [ ] Select saved shipping address
- [ ] Add new shipping address inline during checkout
- [ ] Select shipping delivery method (Standard vs Express)
- [ ] Free shipping eligibility detection
- [ ] Coupon code entry & discount re-validation
- [ ] Full itemized order review summary
- [ ] Select payment method: Cash on Delivery (COD)
- [ ] Select payment method: Online Payment Gateway
- [ ] Terms and conditions acceptance checkbox
- [ ] Place Order action button with loading state
- [ ] Order confirmation page with summary receipt

---

## 10. Payment Processing
- [ ] Cash on Delivery (COD) order placement
- [ ] Online payment intent creation (Stripe / Razorpay)
- [ ] Payment gateway client modal / redirect
- [ ] Payment signature verification on backend
- [ ] Payment success webhook listener
- [ ] Payment failure handling & retry option
- [ ] Transaction record creation in database
- [ ] Payment status tracking: `PENDING`, `PAID`, `FAILED`, `REFUNDED`
- [ ] Online refund processing integration

---

## 11. Customer Orders & Tracking
- [ ] Atomic stock reservation on order creation
- [ ] Automatic inventory decrement upon payment confirmation
- [ ] Order creation confirmation with unique order number
- [ ] View customer order history (Paginated)
- [ ] Filter order history by status
- [ ] View detailed order breakdown (Items, address, payment, pricing)
- [ ] Visual order progress timeline:
  - `PENDING`
  - `CONFIRMED`
  - `PROCESSING`
  - `PACKED`
  - `SHIPPED`
  - `OUT_FOR_DELIVERY`
  - `DELIVERED`
  - `CANCELLED`
- [ ] Cancel order action (Allowed if `PENDING` or `CONFIRMED`)
- [ ] Downloadable PDF invoice generation

---

## 12. Returns & Refunds Management
- [ ] Customer: Request return / refund on delivered order items
- [ ] Customer: Select return reason (Damaged, Wrong item, Quality issue)
- [ ] Customer: Upload proof photos for return request
- [ ] Admin: View all return/refund requests queue
- [ ] Admin: Approve / Reject return request
- [ ] Admin: Trigger online refund via payment gateway
- [ ] Automatic stock replenishment on returned items
- [ ] Return status timeline (`REQUESTED`, `APPROVED`, `REJECTED`, `REFUNDED`)

---

## 13. Inventory & Stock Control
- [ ] Real-time product stock quantity tracking
- [ ] Variant-level stock quantity tracking
- [ ] Stock decrement on successful order
- [ ] Stock increment on cancelled or returned order
- [ ] Low-stock threshold detection (e.g. stock <= 5)
- [ ] Out-of-stock automatic status update
- [ ] Admin: Manual stock adjustment / restock
- [ ] Admin: Low-stock warning list on dashboard
- [ ] Pessimistic row locking during checkout to prevent overselling

---

## 14. Promotional Coupons & Discounts
- [ ] Admin: Create promotional coupon
- [ ] Coupon code string (e.g. `SAVE20`)
- [ ] Discount type: `PERCENTAGE` or `FIXED`
- [ ] Discount value
- [ ] Minimum order amount threshold
- [ ] Maximum discount cap (for percentage discounts)
- [ ] Validity start date and expiration date
- [ ] Global usage limit count
- [ ] Per-user usage limit
- [ ] Admin: List all coupons with usage statistics
- [ ] Admin: Toggle coupon active/inactive status
- [ ] Admin: Delete coupon
- [ ] Server-side coupon verification engine

---

## 15. Customer Reviews & Ratings
- [ ] Submit star rating (1 to 5 stars)
- [ ] Write review title and detailed review comment
- [ ] Verified purchaser validation (Only delivered buyers can review)
- [ ] Prevent duplicate reviews per user per product
- [ ] View product reviews list on PDP
- [ ] Star rating breakdown & average rating calculation
- [ ] Admin: View all customer reviews
- [ ] Admin: Approve / Reject customer reviews
- [ ] Admin: Delete inappropriate reviews

---

## 16. Admin Dashboard & Analytics
- [ ] Total Gross Revenue (GMV) metric card
- [ ] Total Orders count metric card
- [ ] Total Customers count metric card
- [ ] Total Products count metric card
- [ ] Pending orders count alert
- [ ] Low-stock & Out-of-stock products alert
- [ ] Pending return/refund requests count alert
- [ ] Recent 10 orders table with quick view
- [ ] Recent registered customers table
- [ ] Sales volume / revenue chart (Daily/Weekly)

---

## 17. Admin Order Management
- [ ] View all customer orders (Paginated)
- [ ] Search orders by order number or customer name
- [ ] Filter orders by order status
- [ ] Filter orders by payment status
- [ ] Filter orders by date range
- [ ] View full order details modal / drawer
- [ ] Update order status (`CONFIRMED` ➔ `PROCESSING` ➔ `PACKED` ➔ `SHIPPED` ➔ `DELIVERED`)
- [ ] Add courier tracking number, courier company name, and tracking URL
- [ ] Admin order cancellation with stock replenishment

---

## 18. Admin Customer Oversight
- [ ] Searchable customer directory
- [ ] View customer profile details
- [ ] View customer lifetime spend and total order count
- [ ] View customer order history
- [ ] View customer saved addresses
- [ ] Toggle customer account active / suspended status

---

## 19. Transactional Notifications & Emails
- [ ] Order confirmation email to customer
- [ ] Order status change notification email (Shipped, Out for Delivery, Delivered)
- [x] Password reset token email
- [ ] Low-stock notification email to store admin
- [ ] Return request status update email

---

## 20. File Uploads & Media Management
- [ ] Multer multipart file upload handling in NestJS
- [ ] Strict file MIME type validation (JPEG, PNG, WebP)
- [ ] File size limit enforcement (Max 5MB per image)
- [ ] Local static storage serving `/uploads/`
- [ ] Storage service abstraction (Ready for S3 / Cloudinary switch)
- [ ] Delete orphaned image files on product deletion

---

## 21. Database Schemas, Indexes & Data Seeders
- [x] Mongoose Schema & Model definitions with strict typing (Users, Roles, StaffInvitations, AuditLogs, MFA)
- [x] MongoDB compound and unique indexing scripts
- [x] Seed script: Super Admin user initialization
- [x] Seed script: Default sample categories & subcategories
- [ ] Seed script: Demo products with variants and images
- [ ] Seed script: Demo customer account with sample orders

---

## 22. Frontend UI/UX Shell & Feedback Elements
- [x] Toast notification system (Success, Error, Warning, Info)
- [x] Action confirmation modals (`ConfirmDialog`)
- [x] Slide-over drawer component (`Drawer`)
- [x] Mobile navigation drawer / responsive hamburger menu
- [x] Breadcrumbs navigation component
- [x] Scoped outlet API loader (`ApiLoader` without refreshing sidebar/navbar)
- [x] Skeleton loaders for cards, tables, and product details
- [x] Form submission button loading spinners (`Button` with `isLoading`)
- [x] Design standard: Zero-shadow aesthetic with `rounded-md` across count cards, tables, and dialogs
- [x] Unique vibrant Flat Color Icons (`react-icons/fc`) for dashboard & management count cards
- [ ] Empty state placeholders with call-to-action buttons

---

## 23. API, Security & System Foundations
- [x] NestJS modular architecture (Modules, Controllers, Services, Schemas/Models)
- [x] Interactive Swagger UI documentation at `/api/docs`
- [x] Global request DTO validation pipe with `class-validator`
- [x] Global HTTP exception filter with uniform error envelopes
- [x] Global response transform interceptor (`{ success, data, meta }` with unwrap safeguards)
- [x] Dual-portal session isolation (customer vs admin)
- [x] MongoDB connection pool with `@nestjs/mongoose` and `mongoose` (Compass / Atlas)
- [x] Health check endpoint (`GET /api/v1/health`)
- [x] Helmet security headers
- [x] CORS whitelisting configuration
- [x] Rate limiting on auth and sensitive routes via `@nestjs/throttler`
- [x] Secure HttpOnly, SameSite, Secure cookie handling
- [x] Docker Compose orchestration (MongoDB 7, NestJS, React)
