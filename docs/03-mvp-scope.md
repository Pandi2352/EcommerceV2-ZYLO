# MVP Scope & Boundary Matrix (Anti-Feature-Creep)

## 1. The Core MVP Objective
The primary objective of the MVP is to achieve a fully verified, end-to-end commerce loop:
> **A customer registers, discovers a product, adds it to their cart, enters a shipping address, applies a coupon, places an order (COD or Online Test Gateway), and receives order confirmation — while an admin can log into a dedicated portal, manage the product catalog, monitor inventory, and fulfill or transition the order.**

Any feature that does not directly support this loop is categorized as post-MVP.

---

## 2. Scope Matrix

| Category | Must Have (MVP Core) | Should Have (MVP Polish) | Could Have (Phase 7) | Won't Have (Post-MVP) |
|---|---|---|---|---|
| **Authentication** | Email/Password, JWT in HttpOnly cookies, Roles (`CUSTOMER`, `ADMIN`) | Forgot / Reset Password with one-time token | Social Auth (Google/GitHub) | Multi-factor Auth (MFA/TOTP), Enterprise SSO |
| **Catalog** | Categories, Products, SKUs, Prices, Single Image upload, Stock count | Product Variants (Size, Color), Multiple Images, Discount price | Brand directory, Product Tags, Subcategories | Dynamic 3D model viewer, AR preview |
| **Discovery** | Text Search, Category filter, Price sort | Price range slider, In-stock filter, Pagination | Search typeahead autocomplete, Faceted search counts | Vector semantic search, AI product recommendations |
| **Cart & Wishlist** | Add/Remove/Update quantity, Stock limit validation, Server-side price calculation | Persistent database cart for logged-in users, Basic wishlist | Move wishlist to cart, Guest-to-user cart merge | Shared carts, Collaborative cart |
| **Checkout** | Saved Address selection, Shipping method, Server-side order total | Coupon code discount validation (Fixed / %) | Address validation via 3rd party API | Multi-destination shipping |
| **Payments** | Cash on Delivery (COD), 1 Test Gateway (Stripe or Razorpay test mode) | Webhook verification, Transaction status log | Multiple online gateways, Wallet payments | Cryptocurrency, BNPL (Klarna/Affirm), Split payments |
| **Orders** | Order creation transaction, Status (`PENDING` to `DELIVERED`), Customer history | Order cancellation (while pending), Printable order summary | PDF Invoice download generator | Return request self-service portal, Exchange engine |
| **Inventory** | Stock decrement on order confirm, Low stock alert flag | Stock reservation during checkout | Multi-warehouse inventory, Stock transfer | Automated supplier reorder triggers, Dropshipping |
| **Admin Portal** | Product CRUD, Order list & Status updater, Simple KPI counters | Inventory stock editor, Category manager, Customer list | Coupon manager, Review moderator | Advanced BI dashboards, Automated tax reporting |
| **Infrastructure** | Express, MongoDB Mongoose, React, Tailwind, Docker Compose baseline | Structured logging (Winston), Centralized error handler | Redis Caching, BullMQ workers | Kubernetes, Kafka, Microservices, Service Mesh |
| **AI Features** | **NONE** | **NONE** | Offline AI mock embeddings | Live LLM assistant, Automated description gen |

---

## 3. Explicit "DO NOT BUILD" Directives for AI Agents
1. **NO Microservices**: The system is and remains a modular monolith during MVP. Do not split into microservice repos or introduce gRPC.
2. **NO Message Brokers Early**: Do not install Kafka, RabbitMQ, or NATS. Standard async functions or simple Node event emitters are sufficient before Phase 7.
3. **NO Multi-Vendor / Marketplace**: Do not design seller registration, merchant commissions, or split payouts in the MVP database schemas.
4. **NO External Search Engines**: Do not integrate Elasticsearch, OpenSearch, or Algolia until MongoDB text indexes prove insufficient.
5. **NO Premature AI Integration**: Do not add LangChain, LlamaIndex, OpenAI, or Gemini API keys to the core checkout or order paths.

---

## 4. Definition of MVP Done (Exit Criteria)
- [ ] New user can register, log in, update their profile, and add an address.
- [ ] Admin can create a category, upload a product with price, images, and stock.
- [ ] Customer can search and filter catalog, view product details, select variant, and add to cart.
- [ ] Cart correctly calculates subtotal, discounts, and taxes on the backend.
- [ ] Customer can checkout with COD or test gateway; inventory is decremented atomically.
- [ ] Customer sees order in their order history with live status.
- [ ] Admin sees new order in Admin Dashboard, changes status to `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED`.
- [ ] Zero TypeScript errors across both `client/` and `server/`.
