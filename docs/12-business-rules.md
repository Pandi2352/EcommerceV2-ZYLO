# E-Commerce Core Business Rules

## 1. Golden Rules of Commerce (Inviolable Principles)

1. **The Server is the Sole Arbiter of Money**:
   - The frontend never submits unit prices, discounts, subtotal, shipping fee, tax, or grand total.
   - The frontend submits only product IDs, variant IDs, quantities, address IDs, and coupon codes.
   - The NestJS backend loads product documents from MongoDB, evaluates verified prices, applies active discounts, and calculates the exact final sum.

2. **Immutable Historical Records**:
   - When an order is placed, an immutable snapshot of item prices, variant titles, product names, and shipping addresses is persisted as embedded `items` subdocuments in the `orders` collection.
   - Subsequent price alterations or catalog edits in the `products` collection MUST NEVER mutate historical order documents.

3. **Client Payment Status Cannot Be Trusted**:
   - Any client-side payment confirmation is treated as pending.
   - Transitions to `PAID` or `CONFIRMED` require verified server-side cryptographic signatures or webhook receipts from the payment gateway.

---

## 2. Inventory & Stock Rules in MongoDB

### 2.1 Concurrency & Conditional Atomic Stock Updates
- During checkout, multiple concurrent buyers may attempt to purchase the same inventory.
- Stock checks and deductions MUST happen in a single conditional atomic update, never as a separate read-then-write:
  ```typescript
  const result = await this.productModel.updateOne(
    { _id: productId, 'variants._id': variantId, 'variants.stock': { $gte: qty } },
    { $inc: { 'variants.$.stock': -qty } },
    { session },
  );
  if (result.modifiedCount !== 1) {
    throw new BadRequestException('Insufficient stock');
  }
  ```
- If `modifiedCount` is `0` (available stock is lower than the requested quantity), abort and roll back immediately with `BadRequestException('Insufficient stock')`.
- When several documents must commit together (the order, stock decrements across multiple products, and coupon usage), run all writes inside a Mongoose session transaction (`connection.startSession()` + `session.withTransaction(...)`), passing `{ session }` to every operation.
- MongoDB transactions require a replica set: MongoDB Atlas in hosted environments, or a single-node replica set (`mongod --replSet rs0`) locally and in Docker.

### 2.2 Inventory Mathematics
```
Available Stock to Sell = Total Stock Quantity - Reserved Stock Quantity
```

---

## 3. Order State Machine

Order state progression follows a strict non-cyclical lifecycle:

```mermaid
stateDiagram-v2
    [*] --> PENDING: Order Created
    PENDING --> CONFIRMED: Payment Signature Verified / COD Confirmed
    PENDING --> CANCELLED: Payment Failed / Cancelled by User
    CONFIRMED --> PROCESSING: Transferred to Fulfillment
    CONFIRMED --> CANCELLED: Cancelled by Admin
    PROCESSING --> PACKED: Items Packaged
    PACKED --> SHIPPED: Transferred to Courier
    SHIPPED --> OUT_FOR_DELIVERY: Local Courier Hub Dispatch
    OUT_FOR_DELIVERY --> DELIVERED: Proof of Delivery Confirmed
    DELIVERED --> [*]
    CANCELLED --> [*]
```

### 3.1 Cancellation Window
- **Customer**: Allowed to cancel ONLY if `order_status IN ('PENDING', 'CONFIRMED')`.
- Once an order reaches `PROCESSING` or `PACKED`, cancellation requires contacting customer support.

---

## 4. Promotional Coupon Mathematics

### 4.1 Validity Criteria
A coupon code is valid if and only if all of the following conditions pass:
1. `coupon.is_active = TRUE`
2. `CURRENT_TIMESTAMP >= coupon.start_date AND CURRENT_TIMESTAMP <= coupon.end_date`
3. `coupon.usage_limit IS NULL OR coupon.used_count < coupon.usage_limit`
4. `cart_subtotal >= coupon.min_order_amount`

### 4.2 Discount Calculations
- **Percentage Discount**:
  ```
  calculatedDiscount = (cart_subtotal * coupon.discount_value) / 100
  finalDiscount = coupon.max_discount_amount 
    ? Math.min(calculatedDiscount, coupon.max_discount_amount) 
    : calculatedDiscount
  ```
- **Fixed Discount**:
  ```
  finalDiscount = Math.min(coupon.discount_value, cart_subtotal)
  ```
- **Non-Negative Floor**: `grand_total = Math.max(0, subtotal - finalDiscount + shipping_fee + tax)`.

---

## 5. Review & Rating Eligibility

- Only customers who have completed an order with `order_status = 'DELIVERED'` containing the specified `product_id` can review that product.
- Enforced by a unique compound index `{ product: 1, user: 1 }` on the `reviews` collection.
- Product `rating_avg` and `review_count` are recomputed via a MongoDB aggregation pipeline whenever a review is posted or deleted.
