# API Specification & Swagger Documentation

## 1. Global API Standards

- **Base URL**: `/api/v1`
- **Interactive Swagger UI**: `http://localhost:5000/api/docs`
- **OpenAPI Schema JSON**: `http://localhost:5000/api/docs-json`
- **Authentication**: JWT Bearer token via `Authorization: Bearer <token>` header OR automated HttpOnly cookie (`access_token`).
- **Resource Identifiers**: Standard RFC 4122 UUID v4 validated automatically via NestJS `ParseUUIDPipe`.

### 1.1 Standard Response Envelope
All controller responses are transformed into this envelope using a global NestJS `TransformInterceptor`:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 154,
    "totalPages": 8
  }
}
```

### 1.2 Standard Error Envelope
Uncaught exceptions and validation failures are formatted by `HttpExceptionFilter`:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "errors": [
    { "field": "email", "messages": ["email must be a valid email address"] },
    { "field": "password", "messages": ["password must be longer than or equal to 8 characters"] }
  ],
  "timestamp": "2026-09-30T10:25:00.000Z",
  "path": "/api/v1/auth/register"
}
```

---

## 2. API Endpoints Catalog (Mapped to Swagger Tags)

### 2.1 `@ApiTags('Auth')` (`/api/v1/auth`)
| Method | Endpoint | Auth | Description | Swagger DTO |
|---|---|---|---|---|
| `POST` | `/auth/register` | Public | Register customer account | `RegisterDto` |
| `POST` | `/auth/login` | Public | Login credentials, sets auth cookies | `LoginDto` |
| `POST` | `/auth/refresh` | Public | Silently refresh access token via cookie | N/A |
| `POST` | `/auth/logout` | Authenticated | Clears cookies, invalidates session | N/A |
| `POST` | `/auth/forgot-password` | Public | Sends password reset token | `ForgotPasswordDto` |
| `POST` | `/auth/reset-password` | Public | Resets password with token | `ResetPasswordDto` |
| `GET` | `/auth/me` | Authenticated | Returns current authenticated user | N/A |

---

### 2.2 `@ApiTags('Users')` (`/api/v1/users`)
| Method | Endpoint | Auth | Description | Swagger DTO |
|---|---|---|---|---|
| `PATCH` | `/users/profile` | Authenticated | Update user name, phone, or avatar | `UpdateProfileDto` |
| `PATCH` | `/users/change-password` | Authenticated | Change current password | `ChangePasswordDto` |
| `GET` | `/users/addresses` | Authenticated | List all saved addresses | N/A |
| `POST` | `/users/addresses` | Authenticated | Create a new shipping address | `CreateAddressDto` |
| `PUT` | `/users/addresses/:id` | Authenticated | Update address (`:id` = UUID) | `UpdateAddressDto` |
| `DELETE`| `/users/addresses/:id` | Authenticated | Delete address | N/A |
| `PATCH` | `/users/addresses/:id/default` | Authenticated | Set address as default | N/A |

---

### 2.3 `@ApiTags('Categories')` & `@ApiTags('Brands')`
| Method | Endpoint | Auth | Description | Swagger DTO |
|---|---|---|---|---|
| `GET` | `/categories` | Public | List all active categories | N/A |
| `GET` | `/categories/:slug` | Public | Get single category by slug | N/A |
| `POST` | `/categories` | Admin | Create category | `CreateCategoryDto` |
| `PUT` | `/categories/:id` | Admin | Update category | `UpdateCategoryDto` |
| `DELETE`| `/categories/:id` | Admin | Delete category | N/A |
| `GET` | `/brands` | Public | List all active brands | N/A |
| `POST` | `/brands` | Admin | Create brand | `CreateBrandDto` |

---

### 2.4 `@ApiTags('Products')` (`/api/v1/products`)
| Method | Endpoint | Auth | Description | Swagger DTO |
|---|---|---|---|---|
| `GET` | `/products` | Public | Paginated product list with search/filter | `ProductQueryDto` |
| `GET` | `/products/:slug` | Public | Get product detail, images, and variants | N/A |
| `POST` | `/products` | Admin | Create new product, variants, and stock | `CreateProductDto` |
| `PUT` | `/products/:id` | Admin | Update existing product | `UpdateProductDto` |
| `DELETE`| `/products/:id` | Admin | Soft-delete / Unpublish product | N/A |
| `POST` | `/products/:id/images` | Admin | Upload images (multipart/form-data) | `UploadImagesDto` |

---

### 2.5 `@ApiTags('Cart')` (`/api/v1/cart`)
| Method | Endpoint | Auth | Description | Swagger DTO |
|---|---|---|---|---|
| `GET` | `/cart` | Authenticated | Get active cart with live price recalculation | N/A |
| `POST` | `/cart/items` | Authenticated | Add item to cart | `AddCartItemDto` |
| `PATCH` | `/cart/items/:id` | Authenticated | Update quantity of a cart item | `UpdateCartItemDto` |
| `DELETE`| `/cart/items/:id` | Authenticated | Remove item from cart | N/A |
| `POST` | `/cart/apply-coupon` | Authenticated | Apply promotional coupon | `ApplyCouponDto` |
| `DELETE`| `/cart/remove-coupon`| Authenticated | Remove coupon | N/A |
| `DELETE`| `/cart` | Authenticated | Clear cart | N/A |

---

### 2.6 `@ApiTags('Wishlist')` (`/api/v1/wishlist`)
| Method | Endpoint | Auth | Description | Swagger DTO |
|---|---|---|---|---|
| `GET` | `/wishlist` | Authenticated | List all items in customer wishlist | N/A |
| `POST` | `/wishlist` | Authenticated | Add product to wishlist | `AddWishlistDto` |
| `DELETE`| `/wishlist/:productId` | Authenticated | Remove product from wishlist | N/A |

---

### 2.7 `@ApiTags('Orders')` (`/api/v1/orders`)
| Method | Endpoint | Auth | Description | Swagger DTO |
|---|---|---|---|---|
| `POST` | `/orders` | Authenticated | Place order (MongoDB multi-document transaction) | `CreateOrderDto` |
| `GET` | `/orders` | Authenticated | Customer order history (paginated) | `PaginationQueryDto` |
| `GET` | `/orders/:id` | Authenticated | Get order details and items | N/A |
| `POST` | `/orders/:id/cancel` | Authenticated | Cancel order (if `PENDING`/`CONFIRMED`) | N/A |

---

### 2.8 `@ApiTags('Payments')` (`/api/v1/payments`)
| Method | Endpoint | Auth | Description | Swagger DTO |
|---|---|---|---|---|
| `POST` | `/payments/create-intent`| Authenticated | Create online payment order | `CreatePaymentIntentDto` |
| `POST` | `/payments/verify` | Authenticated | Verify signature and update order status | `VerifyPaymentDto` |
| `POST` | `/payments/webhook` | Public | Asynchronous gateway webhook | N/A |

---

### 2.9 `@ApiTags('Admin')` (`/api/v1/admin`)
| Method | Endpoint | Auth | Description | Swagger DTO |
|---|---|---|---|---|
| `GET` | `/admin/dashboard` | Admin | Retrieve sales KPIs and low-stock alerts | N/A |
| `GET` | `/admin/orders` | Admin | Paginated list of all customer orders | `AdminOrderQueryDto` |
| `PATCH` | `/admin/orders/:id/status`| Admin | Advance order status (`SHIPPED`, etc.) | `UpdateOrderStatusDto` |
| `GET` | `/admin/customers` | Admin | Customer directory with lifetime metrics | `PaginationQueryDto` |
| `PATCH` | `/admin/customers/:id/status`| Admin | Activate/Deactivate customer account | `UpdateCustomerStatusDto` |
| `POST` | `/admin/coupons` | Admin | Create promotional coupon | `CreateCouponDto` |
