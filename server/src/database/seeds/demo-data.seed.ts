import mongoose, { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

// Schemas & Models
import { User, UserSchema, UserStatus } from '../../modules/users/schemas/user.schema';
import { UserRole } from '../../common/enums/user-role.enum';
import { AccountType } from '../../common/enums/account-type.enum';
import { Order, OrderSchema, OrderStatus, PaymentMethod, PaymentStatus, DeliveryMethod } from '../../modules/orders/schemas/order.schema';
import { Product, ProductSchema } from '../../modules/products/schemas/product.schema';
import { ReturnRequest, ReturnRequestSchema, ReturnReason, ReturnStatus } from '../../modules/returns/schemas/return-request.schema';
import { Review, ReviewSchema } from '../../modules/reviews/schemas/review.schema';
import { Wishlist, WishlistSchema } from '../../modules/wishlist/schemas/wishlist.schema';

export async function seedDemoData(mongoUri?: string) {
  const uri = mongoUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/zylo';
  console.log(`Connecting to database at ${uri}...`);

  const conn = await mongoose.createConnection(uri).asPromise();
  console.log('Connected to MongoDB successfully.');

  try {
    const UserModel = conn.model(User.name, UserSchema);
    const OrderModel = conn.model(Order.name, OrderSchema);
    const ProductModel = conn.model(Product.name, ProductSchema);
    const ReturnModel = conn.model(ReturnRequest.name, ReturnRequestSchema);
    const ReviewModel = conn.model(Review.name, ReviewSchema);
    const WishlistModel = conn.model(Wishlist.name, WishlistSchema);

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. SEED DEMO CUSTOMERS
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n--- 1. Seeding Demo Customer Accounts ---');
    const passwordHash = await bcrypt.hash('CustomerPassword123!', 12);

    const demoCustomers = [
      {
        email: 'customer@zylo.com',
        name: 'Alex Morgan',
        firstName: 'Alex',
        lastName: 'Morgan',
        role: UserRole.CUSTOMER,
        accountType: AccountType.CUSTOMER,
        status: UserStatus.ACTIVE,
        isActive: true,
        phone: '+1 (555) 234-5678',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        addresses: [
          {
            _id: new Types.ObjectId().toString(),
            street: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'IL',
            postalCode: '62704',
            country: 'US',
            phone: '+1 (555) 234-5678',
            isDefault: true,
          },
          {
            _id: new Types.ObjectId().toString(),
            street: '450 Silicon Avenue, Suite 1200',
            city: 'San Jose',
            state: 'CA',
            postalCode: '95110',
            country: 'US',
            phone: '+1 (555) 234-5679',
            isDefault: false,
          },
        ],
      },
      {
        email: 'sarah.jenkins@zylo.com',
        name: 'Sarah Jenkins',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        role: UserRole.CUSTOMER,
        accountType: AccountType.CUSTOMER,
        status: UserStatus.ACTIVE,
        isActive: true,
        phone: '+1 (555) 876-5432',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        addresses: [
          {
            _id: new Types.ObjectId().toString(),
            street: '88 Queen Street West, Apt 14B',
            city: 'Toronto',
            state: 'ON',
            postalCode: 'M5H 2M5',
            country: 'CA',
            phone: '+1 (555) 876-5432',
            isDefault: true,
          },
        ],
      },
    ];

    const customerDocs: any[] = [];
    for (const custData of demoCustomers) {
      let cust = await UserModel.findOne({ email: custData.email });
      if (!cust) {
        cust = await UserModel.create({
          ...custData,
          passwordHash,
        });
        console.log(` Created demo customer: ${cust.email} (${cust.name})`);
      } else {
        cust.passwordHash = passwordHash;
        cust.name = custData.name;
        cust.addresses = custData.addresses as any;
        cust.phone = custData.phone;
        cust.avatarUrl = custData.avatarUrl;
        await cust.save();
        console.log(` Updated existing demo customer: ${cust.email}`);
      }
      customerDocs.push(cust);
    }

    const primaryCustomer = customerDocs[0];
    const secondaryCustomer = customerDocs[1];

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. FETCH CATALOG PRODUCTS
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n--- 2. Fetching Catalog Products for Line Items ---');
    const products = await ProductModel.find({ status: 'PUBLISHED' }).limit(20).exec();
    if (products.length === 0) {
      throw new Error('No published products found in database! Please ensure products are seeded first.');
    }
    console.log(` Found ${products.length} catalog products available for sample orders.`);

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. SEED REALISTIC ORDERS
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n--- 3. Seeding Realistic Customer Orders ---');
    const now = new Date();
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
    const daysAhead = (d: number) => new Date(now.getTime() + d * 86400000);

    const p0 = products[0];
    const p1 = products[1] || products[0];
    const p2 = products[2] || products[0];
    const p3 = products[3] || products[0];
    const p4 = products[4] || products[0];
    const p5 = products[5] || products[0];

    const sampleOrdersDef = [
      {
        orderNumber: 'ZYLO-2026-901101',
        customer: primaryCustomer,
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.ONLINE,
        deliveryMethod: DeliveryMethod.EXPRESS,
        items: [
          {
            productId: p0._id,
            productSlug: p0.slug,
            name: p0.name,
            brandName: 'Apple',
            image: p0.thumbnailUrl || p0.images?.[0]?.url || '',
            unitPrice: p0.basePrice,
            quantity: 1,
            lineTotal: p0.basePrice,
            variantSku: p0.variants?.[0]?.sku || null,
            variantTitle: p0.variants?.[0]?.title || null,
          },
          {
            productId: p1._id,
            productSlug: p1.slug,
            name: p1.name,
            brandName: 'Sony',
            image: p1.thumbnailUrl || p1.images?.[0]?.url || '',
            unitPrice: p1.basePrice,
            quantity: 1,
            lineTotal: p1.basePrice,
            variantSku: p1.variants?.[0]?.sku || null,
            variantTitle: p1.variants?.[0]?.title || null,
          },
        ],
        courierName: 'FedEx Express',
        trackingNumber: 'FEDEX-9482019482',
        trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=9482019482',
        createdAt: daysAgo(12),
        shippedAt: daysAgo(10),
        deliveredAt: daysAgo(8),
        estimatedDeliveryDate: daysAgo(8),
        statusHistory: [
          { status: OrderStatus.CONFIRMED, timestamp: daysAgo(12), note: 'Order placed & payment verified' },
          { status: OrderStatus.PROCESSING, timestamp: daysAgo(11), note: 'Packed at fulfillment center' },
          { status: OrderStatus.SHIPPED, timestamp: daysAgo(10), note: 'Dispatched via FedEx Express' },
          { status: OrderStatus.OUT_FOR_DELIVERY, timestamp: daysAgo(8), note: 'Out for final delivery' },
          { status: OrderStatus.DELIVERED, timestamp: daysAgo(8), note: 'Signed and delivered at doorstep' },
        ],
      },
      {
        orderNumber: 'ZYLO-2026-901102',
        customer: primaryCustomer,
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.ONLINE,
        deliveryMethod: DeliveryMethod.STANDARD,
        items: [
          {
            productId: p2._id,
            productSlug: p2.slug,
            name: p2.name,
            brandName: 'Logitech',
            image: p2.thumbnailUrl || p2.images?.[0]?.url || '',
            unitPrice: p2.basePrice,
            quantity: 2,
            lineTotal: +(p2.basePrice * 2).toFixed(2),
            variantSku: p2.variants?.[0]?.sku || null,
            variantTitle: p2.variants?.[0]?.title || null,
          },
        ],
        courierName: 'UPS Ground',
        trackingNumber: 'UPS-1Z999AA10123456784',
        trackingUrl: 'https://www.ups.com/track?loc=en_US&tracknum=1Z999AA10123456784',
        createdAt: daysAgo(6),
        shippedAt: daysAgo(4),
        deliveredAt: daysAgo(2),
        estimatedDeliveryDate: daysAgo(2),
        statusHistory: [
          { status: OrderStatus.CONFIRMED, timestamp: daysAgo(6), note: 'Order placed' },
          { status: OrderStatus.PROCESSING, timestamp: daysAgo(5), note: 'Items verified' },
          { status: OrderStatus.SHIPPED, timestamp: daysAgo(4), note: 'Handed over to UPS' },
          { status: OrderStatus.DELIVERED, timestamp: daysAgo(2), note: 'Delivered to front porch' },
        ],
      },
      {
        orderNumber: 'ZYLO-2026-901103',
        customer: primaryCustomer,
        status: OrderStatus.OUT_FOR_DELIVERY,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.ONLINE,
        deliveryMethod: DeliveryMethod.EXPRESS,
        items: [
          {
            productId: p3._id,
            productSlug: p3.slug,
            name: p3.name,
            brandName: 'Dyson',
            image: p3.thumbnailUrl || p3.images?.[0]?.url || '',
            unitPrice: p3.basePrice,
            quantity: 1,
            lineTotal: p3.basePrice,
            variantSku: p3.variants?.[0]?.sku || null,
            variantTitle: p3.variants?.[0]?.title || null,
          },
        ],
        courierName: 'USPS Priority Mail',
        trackingNumber: 'USPS-940011189956281920',
        trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=940011189956281920',
        createdAt: daysAgo(3),
        shippedAt: daysAgo(1),
        estimatedDeliveryDate: daysAhead(0),
        statusHistory: [
          { status: OrderStatus.CONFIRMED, timestamp: daysAgo(3), note: 'Order placed' },
          { status: OrderStatus.PROCESSING, timestamp: daysAgo(2), note: 'Warehouse picking completed' },
          { status: OrderStatus.SHIPPED, timestamp: daysAgo(1), note: 'Shipped from hub' },
          { status: OrderStatus.OUT_FOR_DELIVERY, timestamp: daysAgo(0), note: 'With courier driver for delivery' },
        ],
      },
      {
        orderNumber: 'ZYLO-2026-901104',
        customer: secondaryCustomer,
        status: OrderStatus.SHIPPED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.ONLINE,
        deliveryMethod: DeliveryMethod.STANDARD,
        items: [
          {
            productId: p4._id,
            productSlug: p4.slug,
            name: p4.name,
            brandName: 'Samsung',
            image: p4.thumbnailUrl || p4.images?.[0]?.url || '',
            unitPrice: p4.basePrice,
            quantity: 1,
            lineTotal: p4.basePrice,
            variantSku: p4.variants?.[0]?.sku || null,
            variantTitle: p4.variants?.[0]?.title || null,
          },
        ],
        courierName: 'DHL Express',
        trackingNumber: 'DHL-3910294821',
        trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB=3910294821',
        createdAt: daysAgo(2),
        shippedAt: daysAgo(1),
        estimatedDeliveryDate: daysAhead(2),
        statusHistory: [
          { status: OrderStatus.CONFIRMED, timestamp: daysAgo(2), note: 'Order confirmed' },
          { status: OrderStatus.PROCESSING, timestamp: daysAgo(2), note: 'Packed' },
          { status: OrderStatus.SHIPPED, timestamp: daysAgo(1), note: 'In transit via DHL' },
        ],
      },
      {
        orderNumber: 'ZYLO-2026-901105',
        customer: primaryCustomer,
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.ONLINE,
        deliveryMethod: DeliveryMethod.STANDARD,
        items: [
          {
            productId: p5._id,
            productSlug: p5.slug,
            name: p5.name,
            brandName: 'Nike',
            image: p5.thumbnailUrl || p5.images?.[0]?.url || '',
            unitPrice: p5.basePrice,
            quantity: 1,
            lineTotal: p5.basePrice,
            variantSku: p5.variants?.[0]?.sku || null,
            variantTitle: p5.variants?.[0]?.title || null,
          },
        ],
        createdAt: daysAgo(1),
        estimatedDeliveryDate: daysAhead(4),
        statusHistory: [
          { status: OrderStatus.CONFIRMED, timestamp: daysAgo(1), note: 'Payment verified' },
          { status: OrderStatus.PROCESSING, timestamp: daysAgo(0), note: 'Allocated to fulfillment crew' },
        ],
      },
      {
        orderNumber: 'ZYLO-2026-901106',
        customer: secondaryCustomer,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.COD,
        deliveryMethod: DeliveryMethod.STANDARD,
        items: [
          {
            productId: p0._id,
            productSlug: p0.slug,
            name: p0.name,
            brandName: 'Apple',
            image: p0.thumbnailUrl || p0.images?.[0]?.url || '',
            unitPrice: p0.basePrice,
            quantity: 1,
            lineTotal: p0.basePrice,
            variantSku: p0.variants?.[0]?.sku || null,
            variantTitle: p0.variants?.[0]?.title || null,
          },
        ],
        createdAt: daysAgo(0),
        estimatedDeliveryDate: daysAhead(5),
        statusHistory: [
          { status: OrderStatus.CONFIRMED, timestamp: daysAgo(0), note: 'Cash on Delivery order booked' },
        ],
      },
      {
        orderNumber: 'ZYLO-2026-901107',
        customer: primaryCustomer,
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.REFUNDED,
        paymentMethod: PaymentMethod.ONLINE,
        deliveryMethod: DeliveryMethod.STANDARD,
        items: [
          {
            productId: p1._id,
            productSlug: p1.slug,
            name: p1.name,
            brandName: 'Sony',
            image: p1.thumbnailUrl || p1.images?.[0]?.url || '',
            unitPrice: p1.basePrice,
            quantity: 1,
            lineTotal: p1.basePrice,
          },
        ],
        createdAt: daysAgo(15),
        cancelledAt: daysAgo(14),
        cancellationReason: 'Customer requested cancellation: Found a better price',
        estimatedDeliveryDate: daysAgo(10),
        statusHistory: [
          { status: OrderStatus.CONFIRMED, timestamp: daysAgo(15), note: 'Order placed' },
          { status: OrderStatus.CANCELLED, timestamp: daysAgo(14), note: 'Cancelled by customer; stock restored' },
        ],
      },
    ];

    const seededOrders: any[] = [];
    for (const def of sampleOrdersDef) {
      let existingOrder = await OrderModel.findOne({ orderNumber: def.orderNumber });
      const subtotal = def.items.reduce((s, i) => s + i.lineTotal, 0);
      const shippingFee = def.deliveryMethod === DeliveryMethod.EXPRESS ? 15.0 : 0.0;
      const tax = +(subtotal * 0.08).toFixed(2);
      const grandTotal = +(subtotal + shippingFee + tax).toFixed(2);

      const orderPayload: any = {
        orderNumber: def.orderNumber,
        userId: def.customer._id.toString(),
        customerEmail: def.customer.email,
        customerName: def.customer.name,
        shippingAddress: def.customer.addresses[0],
        items: def.items,
        deliveryMethod: def.deliveryMethod,
        subtotal,
        shippingFee,
        discount: 0,
        tax,
        grandTotal,
        paymentMethod: def.paymentMethod,
        paymentStatus: def.paymentStatus,
        orderStatus: def.status,
        statusHistory: def.statusHistory,
        estimatedDeliveryDate: def.estimatedDeliveryDate,
        courierName: def.courierName || null,
        trackingNumber: def.trackingNumber || null,
        trackingUrl: def.trackingUrl || null,
        shippedAt: def.shippedAt || null,
        deliveredAt: def.deliveredAt || null,
        cancelledAt: def.cancelledAt || null,
        cancellationReason: def.cancellationReason || null,
        createdAt: def.createdAt,
        updatedAt: def.deliveredAt || def.shippedAt || def.createdAt,
      };

      if (!existingOrder) {
        existingOrder = await OrderModel.create(orderPayload);
        console.log(` Created Order: ${existingOrder.orderNumber} (${existingOrder.orderStatus}, $${grandTotal})`);
      } else {
        Object.assign(existingOrder, orderPayload);
        await existingOrder.save();
        console.log(` Updated Order: ${existingOrder.orderNumber}`);
      }
      seededOrders.push(existingOrder);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. SEED SAMPLE RETURN REQUESTS
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n--- 4. Seeding Demo Return & Refund Requests ---');
    const deliveredOrder = seededOrders[1]; // Order ZYLO-2026-901102
    if (deliveredOrder && deliveredOrder.items.length > 0) {
      const returnNumber = 'RET-2026-901102';
      const existingReturn = await ReturnModel.findOne({ returnNumber });
      const returnItem = deliveredOrder.items[0];

      if (!existingReturn) {
        await ReturnModel.create({
          returnNumber,
          orderId: deliveredOrder._id,
          orderNumber: deliveredOrder.orderNumber,
          userId: primaryCustomer._id.toString(),
          customerName: primaryCustomer.name,
          customerEmail: primaryCustomer.email,
          items: [
            {
              orderItemId: returnItem._id.toString(),
              productId: returnItem.productId,
              productSlug: returnItem.productSlug,
              name: returnItem.name,
              image: returnItem.image,
              variantSku: returnItem.variantSku,
              variantTitle: returnItem.variantTitle,
              unitPrice: returnItem.unitPrice,
              quantity: 1,
              refundAmount: returnItem.unitPrice,
            },
          ],
          reason: ReturnReason.DAMAGED_ITEM,
          customerNote: 'Packaging arrived crumpled and item has a scuff mark on top right.',
          proofImages: [
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
          ],
          status: ReturnStatus.APPROVED,
          totalRefundAmount: returnItem.unitPrice,
          restockOnApproval: true,
          reviewedBy: 'Store Administrator',
          reviewedAt: daysAgo(1),
          statusHistory: [
            {
              status: ReturnStatus.REQUESTED,
              timestamp: daysAgo(2),
              note: 'Customer requested return for damaged unit',
              changedBy: primaryCustomer.name,
            },
            {
              status: ReturnStatus.APPROVED,
              timestamp: daysAgo(1),
              note: 'Approved by Store Administrator (Stock replenished)',
              changedBy: 'Store Administrator',
            },
          ],
        });
        console.log(` Created return request: ${returnNumber} (Status: APPROVED, $${returnItem.unitPrice})`);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. SEED VERIFIED REVIEWS
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n--- 5. Seeding Verified Customer Reviews ---');
    const reviewDataList = [
      {
        product: p0,
        user: primaryCustomer,
        rating: 5,
        title: 'Outstanding build quality and battery life!',
        comment: 'Upgraded from an older generation and the speed improvement is immediately noticeable. The display is bright outdoors and the camera detail is remarkable.',
        isVerifiedPurchase: true,
        helpfulCount: 14,
      },
      {
        product: p1,
        user: primaryCustomer,
        rating: 5,
        title: 'Best-in-class active noise cancellation',
        comment: 'Blocks out airplane noise and city traffic with ease. Extremely comfortable for long working hours and the audio clarity is top notch.',
        isVerifiedPurchase: true,
        helpfulCount: 9,
      },
      {
        product: p2,
        user: secondaryCustomer,
        rating: 4,
        title: 'Great ergonomics and smooth tracking',
        comment: 'Very comfortable grip for all-day development work. The magnetic scroll wheel is addictive. Only wish it had onboard USB-C dongle storage.',
        isVerifiedPurchase: true,
        helpfulCount: 4,
      },
    ];

    for (const r of reviewDataList) {
      const existing = await ReviewModel.findOne({ productId: r.product._id, userId: r.user._id.toString() });
      if (!existing) {
        await ReviewModel.create({
          productId: r.product._id,
          userId: r.user._id.toString(),
          customerName: r.user.name,
          customerAvatar: r.user.avatarUrl,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          isVerifiedPurchase: r.isVerifiedPurchase,
          helpfulCount: r.helpfulCount,
          status: 'APPROVED',
        });
        console.log(` Created review on "${r.product.name}" by ${r.user.name} (${r.rating} stars)`);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 6. SEED WISHLIST
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n--- 6. Seeding Customer Wishlist ---');
    const existingWishlist = await WishlistModel.findOne({ userId: primaryCustomer._id.toString() });
    if (!existingWishlist) {
      await WishlistModel.create({
        userId: primaryCustomer._id.toString(),
        items: [
          { productId: p3._id, addedAt: daysAgo(5) },
          { productId: p4._id, addedAt: daysAgo(2) },
        ],
      });
      console.log(` Seeded 2 wishlist items for ${primaryCustomer.email}`);
    }

    console.log('\n======================================================');
    console.log(' DEMO DATA SEEDING COMPLETE!');
    console.log(' Demo Customer:  customer@zylo.com / CustomerPassword123!');
    console.log(' Secondary User: sarah.jenkins@zylo.com / CustomerPassword123!');
    console.log(` Orders Seeded:  ${sampleOrdersDef.length} sample orders across all statuses`);
    console.log('======================================================\n');

    return {
      customers: customerDocs.length,
      orders: sampleOrdersDef.length,
      products: products.length,
    };
  } finally {
    await conn.close();
  }
}
