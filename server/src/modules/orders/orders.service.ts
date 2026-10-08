import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DeliveryMethod,
  Order,
  OrderDocument,
  OrderItemSchema,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CheckoutDto } from './dto/checkout.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderTrackingDto } from './dto/update-order-tracking.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { CouponsService } from '../coupons/coupons.service';
import { Setting, SettingDocument } from '../settings/schemas/setting.schema';
import { MailService } from '../mail/mail.service';

const FREE_SHIPPING_THRESHOLD = 50.0;
const STANDARD_SHIPPING_FEE = 5.99;
const EXPRESS_SHIPPING_FEE = 12.99;
const ESTIMATED_TAX_RATE = 0.08;

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Setting.name) private readonly settingModel: Model<SettingDocument>,
    private readonly couponsService: CouponsService,
    private readonly mailService: MailService,
  ) {}

  private async getStoreCurrencySymbol(): Promise<string> {
    try {
      const setting = await this.settingModel.findOne().exec();
      return setting?.currencySymbol || '$';
    } catch {
      return '$';
    }
  }

  private async getStoreAdminEmail(): Promise<string> {
    try {
      const setting = await this.settingModel.findOne().exec();
      return (
        setting?.supportEmail ||
        setting?.salesEmail ||
        process.env.ADMIN_EMAIL ||
        'admin@zylo.internal'
      );
    } catch {
      return process.env.ADMIN_EMAIL || 'admin@zylo.internal';
    }
  }


  async checkout(userId: string, user: UserDocument, dto: CheckoutDto): Promise<OrderDocument> {
    if (!dto.termsAccepted) {
      throw new BadRequestException('You must accept the terms and conditions to place an order');
    }

    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Your shopping cart is empty');
    }

    const selectedCartItems = cart.items.filter((item) => item.selected !== false);
    if (selectedCartItems.length === 0) {
      throw new BadRequestException('No items selected for checkout in your shopping cart');
    }

    // 1. Fetch live product records & validate stock
    const productIds = selectedCartItems.map((i) => i.productId);
    const products = await this.productModel.find({ _id: { $in: productIds } }).exec();
    const productMap = new Map<string, ProductDocument>();
    products.forEach((p) => productMap.set(p._id.toString(), p));

    const orderItems: OrderItemSchema[] = [];
    let subtotal = 0;

    for (const item of selectedCartItems) {
      const prod = productMap.get(item.productId.toString());
      if (!prod) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }

      let unitPrice = prod.salePrice && prod.salePrice > 0 ? prod.salePrice : prod.basePrice;
      let availableStock = prod.stockQuantity ?? 0;
      let variantTitle: string | null = null;
      let imageUrl = prod.thumbnailUrl || (prod.images && prod.images[0]?.url) || '';

      if (item.variantSku && prod.variants?.length) {
        const variant = prod.variants.find((v) => v.sku === item.variantSku);
        if (!variant) {
          throw new NotFoundException(`Variant SKU "${item.variantSku}" not found for product "${prod.name}"`);
        }
        if (variant.price) unitPrice = variant.price;
        if (variant.stockQuantity !== undefined) availableStock = variant.stockQuantity;
        if (variant.imageUrl) imageUrl = variant.imageUrl;
        variantTitle = variant.title || Object.entries(variant.attributes || {})
          .map(([k, val]) => `${k}: ${val}`)
          .join(', ');
      }

      // Stock limit validation
      if (prod.trackInventory && item.quantity > availableStock) {
        throw new BadRequestException(
          `Insufficient stock for "${prod.name}". Requested: ${item.quantity}, Available: ${availableStock}`,
        );
      }

      const lineTotal = +(unitPrice * item.quantity).toFixed(2);
      subtotal += lineTotal;

      orderItems.push({
        _id: new Types.ObjectId().toString(),
        productId: prod._id as Types.ObjectId,
        productSlug: prod.slug,
        name: prod.name,
        brandName: (prod as any).brandName || '',
        image: imageUrl,
        variantSku: item.variantSku || null,
        variantTitle,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
    }

    subtotal = +subtotal.toFixed(2);

    // 2. Decrement inventory atomically for confirmed items & check low stock
    const adminEmail = await this.getStoreAdminEmail();
    for (const item of selectedCartItems) {
      const prod = productMap.get(item.productId.toString());
      if (!prod || !prod.trackInventory) continue;

      let remainingStock = 0;
      let variantTitle: string | null = null;

      if (item.variantSku) {
        const updated = await this.productModel.findOneAndUpdate(
          { _id: prod._id, 'variants.sku': item.variantSku },
          {
            $inc: {
              'variants.$.stockQuantity': -item.quantity,
              stockQuantity: -item.quantity,
            },
          },
          { new: true },
        );
        const variant = updated?.variants?.find((v) => v.sku === item.variantSku);
        remainingStock = variant?.stockQuantity ?? ((prod.stockQuantity || 0) - item.quantity);
        variantTitle = variant?.title || item.variantSku;
      } else {
        const updated = await this.productModel.findOneAndUpdate(
          { _id: prod._id },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true },
        );
        remainingStock = updated?.stockQuantity ?? ((prod.stockQuantity || 0) - item.quantity);
      }

      // Check low stock threshold
      const threshold = prod.lowStockThreshold ?? 5;
      if (remainingStock <= threshold) {
        this.mailService.sendLowStockAlert(prod, remainingStock, adminEmail, variantTitle);
      }
    }

    // 3. Financial calculations
    const couponCode = dto.couponCode || cart.appliedCoupon;
    let shippingFee = 0;
    if (dto.deliveryMethod === DeliveryMethod.EXPRESS) {
      shippingFee = EXPRESS_SHIPPING_FEE;
    } else {
      shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    }

    let discount = 0;
    let validatedCouponCode: string | null = null;
    if (couponCode && subtotal > 0) {
      try {
        const valResult = await this.couponsService.validateCoupon(
          couponCode,
          subtotal,
          userId,
        );
        if (valResult.isValid) {
          discount = valResult.discountAmount;
          validatedCouponCode = valResult.code;
          if (valResult.isFreeShipping) {
            shippingFee = 0;
          }
        }
      } catch {
        discount = 0;
      }
    }

    const tax = +(subtotal * ESTIMATED_TAX_RATE).toFixed(2);
    const grandTotal = +(Math.max(0, subtotal + shippingFee + tax - discount)).toFixed(2);

    // 4. Delivery Estimation
    const daysToAdd = dto.deliveryMethod === DeliveryMethod.EXPRESS ? 2 : 5;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + daysToAdd);

    // 5. Generate unique Order Number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `ZYLO-${new Date().getFullYear()}-${randomSuffix}`;

    const paymentStatus =
      dto.paymentMethod === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.PAID;

    // 6. Create Order document
    const order = new this.orderModel({
      orderNumber,
      userId,
      customerEmail: user.email,
      customerName: user.name,
      shippingAddress: {
        street: dto.shippingAddress.street,
        city: dto.shippingAddress.city,
        state: dto.shippingAddress.state,
        postalCode: dto.shippingAddress.postalCode,
        country: dto.shippingAddress.country || 'US',
        phone: dto.shippingAddress.phone || user.phone || '',
      },
      items: orderItems,
      deliveryMethod: dto.deliveryMethod,
      subtotal,
      shippingFee,
      discount,
      appliedCoupon: validatedCouponCode || null,
      tax,
      grandTotal,
      paymentMethod: dto.paymentMethod,
      paymentStatus,
      orderStatus: OrderStatus.CONFIRMED,
      statusHistory: [
        {
          status: OrderStatus.CONFIRMED,
          timestamp: new Date(),
          note: `Order placed successfully via ${dto.paymentMethod}`,
        },
      ],
      estimatedDeliveryDate,
      notes: dto.notes || '',
    });

    await order.save();

    // 7. Record coupon usage if valid promo code used
    if (validatedCouponCode) {
      await this.couponsService.recordUsage(validatedCouponCode, userId);
    }

    // 8. Remove purchased items from Cart
    const purchasedItemIds = new Set(selectedCartItems.map((i) => i._id));
    cart.items = cart.items.filter((i) => !purchasedItemIds.has(i._id));
    cart.appliedCoupon = null;
    await cart.save();

    // 9. Dispatch order confirmation email (non-blocking in background)
    const currencySymbol = await this.getStoreCurrencySymbol();
    if (order.paymentMethod === PaymentMethod.COD || order.paymentStatus === PaymentStatus.PAID) {
      this.mailService.sendOrderConfirmation(order, currencySymbol);
    }

    return order;
  }

  async getCustomerOrders(userId: string, query: OrderQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = { userId };
    if (query.status) {
      filter.orderStatus = query.status;
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getOrderByIdOrNumber(userId: string, identifier: string): Promise<OrderDocument> {
    const isObjectId = Types.ObjectId.isValid(identifier);
    const filter: any = {
      $or: [
        { orderNumber: identifier.toUpperCase() },
        ...(isObjectId ? [{ _id: identifier }] : []),
      ],
    };

    const order = await this.orderModel.findOne(filter).exec();
    if (!order) {
      throw new NotFoundException(`Order not found: ${identifier}`);
    }

    // Security check: order must belong to this customer
    if (order.userId !== userId) {
      throw new NotFoundException(`Order not found`);
    }

    return order;
  }

  async cancelOrder(userId: string, identifier: string, dto: CancelOrderDto): Promise<OrderDocument> {
    const order = await this.getOrderByIdOrNumber(userId, identifier);

    if (order.orderStatus !== OrderStatus.CONFIRMED && order.orderStatus !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel order with status "${order.orderStatus}". Only confirmed or pending orders can be cancelled.`,
      );
    }

    // Restore inventory
    for (const item of order.items) {
      if (item.variantSku) {
        await this.productModel.updateOne(
          { _id: item.productId, 'variants.sku': item.variantSku },
          {
            $inc: {
              'variants.$.stockQuantity': item.quantity,
              stockQuantity: item.quantity,
            },
          },
        );
      } else {
        await this.productModel.updateOne(
          { _id: item.productId },
          { $inc: { stockQuantity: item.quantity } },
        );
      }
    }

    order.orderStatus = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = dto.reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      note: `Cancelled by customer. Reason: ${dto.reason || 'No reason provided'}`,
    });

    if (order.paymentStatus === PaymentStatus.PAID) {
      order.paymentStatus = PaymentStatus.REFUNDED;
    }

    await order.save();

    // Dispatch status update notification for customer cancellation
    const cancelCurrencySymbol = await this.getStoreCurrencySymbol();
    this.mailService.sendOrderStatusUpdate(order, OrderStatus.CANCELLED, cancelCurrencySymbol);

    return order;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ADMIN ORDER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  async getAdminOrders(query: AdminOrderQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.status && query.status !== ('ALL' as any)) {
      filter.orderStatus = query.status;
    }

    if (query.paymentStatus && query.paymentStatus !== ('ALL' as any)) {
      filter.paymentStatus = query.paymentStatus;
    }

    if (query.paymentMethod && query.paymentMethod !== ('ALL' as any)) {
      filter.paymentMethod = query.paymentMethod;
    }

    if (query.deliveryMethod && query.deliveryMethod !== ('ALL' as any)) {
      filter.deliveryMethod = query.deliveryMethod;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { orderNumber: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { 'shippingAddress.phone': searchRegex },
        { 'shippingAddress.city': searchRegex },
        { trackingNumber: searchRegex },
      ];
    }

    const [orders, total, metrics] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
      this.getAdminOrderMetrics(),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      metrics,
    };
  }

  async getAdminOrderMetrics() {
    const allOrders = await this.orderModel.find({}, 'orderStatus grandTotal paymentStatus').exec();

    let totalOrders = allOrders.length;
    let totalRevenue = 0;
    let pendingCount = 0;
    let processingCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    for (const o of allOrders) {
      if (o.orderStatus !== OrderStatus.CANCELLED) {
        totalRevenue += o.grandTotal || 0;
      }
      if (o.orderStatus === OrderStatus.PENDING || o.orderStatus === OrderStatus.CONFIRMED) {
        pendingCount++;
      } else if (o.orderStatus === OrderStatus.PROCESSING || o.orderStatus === OrderStatus.PACKED) {
        processingCount++;
      } else if (o.orderStatus === OrderStatus.SHIPPED || o.orderStatus === OrderStatus.OUT_FOR_DELIVERY) {
        shippedCount++;
      } else if (o.orderStatus === OrderStatus.DELIVERED) {
        deliveredCount++;
      } else if (o.orderStatus === OrderStatus.CANCELLED) {
        cancelledCount++;
      }
    }

    return {
      totalOrders,
      totalRevenue: +totalRevenue.toFixed(2),
      pendingCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
    };
  }

  async getAdminOrderById(identifier: string): Promise<OrderDocument> {
    const isObjectId = Types.ObjectId.isValid(identifier);
    const filter: any = {
      $or: [
        { orderNumber: identifier.toUpperCase() },
        ...(isObjectId ? [{ _id: identifier }] : []),
      ],
    };

    const order = await this.orderModel.findOne(filter).exec();
    if (!order) {
      throw new NotFoundException(`Order not found: ${identifier}`);
    }

    return order;
  }

  async updateOrderStatusAdmin(orderId: string, dto: UpdateOrderStatusDto): Promise<OrderDocument> {
    const order = await this.getAdminOrderById(orderId);

    const oldStatus = order.orderStatus;
    const newStatus = dto.status;

    if (oldStatus === newStatus) {
      return order;
    }

    // If cancelling, restore inventory
    if (newStatus === OrderStatus.CANCELLED && oldStatus !== OrderStatus.CANCELLED) {
      for (const item of order.items) {
        if (item.variantSku) {
          await this.productModel.updateOne(
            { _id: item.productId, 'variants.sku': item.variantSku },
            {
              $inc: {
                'variants.$.stockQuantity': item.quantity,
                stockQuantity: item.quantity,
              },
            },
          );
        } else {
          await this.productModel.updateOne(
            { _id: item.productId },
            { $inc: { stockQuantity: item.quantity } },
          );
        }
      }
      order.cancelledAt = new Date();
      order.cancellationReason = dto.note || 'Cancelled by admin';
      if (order.paymentStatus === PaymentStatus.PAID) {
        order.paymentStatus = PaymentStatus.REFUNDED;
      }
    }

    // Set fulfillment timestamps
    if (newStatus === OrderStatus.SHIPPED && !order.shippedAt) {
      order.shippedAt = new Date();
    }
    if (newStatus === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
      // Auto-mark COD as paid upon delivery
      if (order.paymentMethod === PaymentMethod.COD && order.paymentStatus === PaymentStatus.PENDING) {
        order.paymentStatus = PaymentStatus.PAID;
      }
    }

    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: dto.note || `Status updated from ${oldStatus} to ${newStatus}`,
    });

    await order.save();

    // Dispatch status update notification to customer
    const updateCurrencySymbol = await this.getStoreCurrencySymbol();
    this.mailService.sendOrderStatusUpdate(order, newStatus, updateCurrencySymbol);

    return order;
  }

  async updateOrderTrackingAdmin(orderId: string, dto: UpdateOrderTrackingDto): Promise<OrderDocument> {
    const order = await this.getAdminOrderById(orderId);

    order.courierName = dto.courierName;
    order.trackingNumber = dto.trackingNumber;
    if (dto.trackingUrl) {
      order.trackingUrl = dto.trackingUrl;
    }

    if (dto.status) {
      order.orderStatus = dto.status;
      if (dto.status === OrderStatus.SHIPPED && !order.shippedAt) {
        order.shippedAt = new Date();
      }
    }

    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: dto.note || `Dispatched via ${dto.courierName} (Tracking: ${dto.trackingNumber})`,
    });

    await order.save();

    // Dispatch tracking update notification to customer
    const trackingCurrencySymbol = await this.getStoreCurrencySymbol();
    this.mailService.sendOrderStatusUpdate(order, order.orderStatus, trackingCurrencySymbol);

    return order;
  }

  async updateOrderPaymentAdmin(orderId: string, dto: UpdatePaymentStatusDto): Promise<OrderDocument> {
    const order = await this.getAdminOrderById(orderId);

    order.paymentStatus = dto.paymentStatus;
    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: dto.note || `Payment status changed to ${dto.paymentStatus}`,
    });

    await order.save();
    return order;
  }

  async exportOrdersAdmin(format: 'json' | 'csv' = 'json') {
    const orders = await this.orderModel.find({}).sort({ createdAt: -1 }).lean().exec();

    if (format === 'csv') {
      const headers = [
        'Order Number',
        'Date',
        'Customer Name',
        'Customer Email',
        'Items Count',
        'Subtotal',
        'Tax',
        'Shipping',
        'Discount',
        'Grand Total',
        'Payment Method',
        'Payment Status',
        'Order Status',
        'Courier',
        'Tracking Number',
      ];

      const rows = orders.map((o) => [
        `"${o.orderNumber}"`,
        `"${new Date((o as any).createdAt).toISOString()}"`,
        `"${o.customerName || ''}"`,
        `"${o.customerEmail || ''}"`,
        (o.items || []).reduce((sum: number, it: any) => sum + (it.quantity || 0), 0),
        o.subtotal || 0,
        o.tax || 0,
        o.shippingFee || 0,
        o.discount || 0,
        o.grandTotal || 0,
        `"${o.paymentMethod || ''}"`,
        `"${o.paymentStatus || ''}"`,
        `"${o.orderStatus || ''}"`,
        `"${o.courierName || ''}"`,
        `"${o.trackingNumber || ''}"`,
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      return {
        data: csv,
        filename: `orders_export_${new Date().toISOString().slice(0, 10)}.csv`,
      };
    }

    return {
      data: orders,
      filename: `orders_export_${new Date().toISOString().slice(0, 10)}.json`,
    };
  }
}
