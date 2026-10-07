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
  ) {}

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

    // 2. Decrement inventory atomically for confirmed items
    for (const item of selectedCartItems) {
      const prod = productMap.get(item.productId.toString());
      if (!prod || !prod.trackInventory) continue;

      if (item.variantSku) {
        await this.productModel.updateOne(
          { _id: prod._id, 'variants.sku': item.variantSku },
          {
            $inc: {
              'variants.$.stockQuantity': -item.quantity,
              stockQuantity: -item.quantity,
            },
          },
        );
      } else {
        await this.productModel.updateOne(
          { _id: prod._id },
          { $inc: { stockQuantity: -item.quantity } },
        );
      }
    }

    // 3. Financial calculations
    const coupon = dto.couponCode || cart.appliedCoupon;
    let shippingFee = 0;
    if (dto.deliveryMethod === DeliveryMethod.EXPRESS) {
      shippingFee = EXPRESS_SHIPPING_FEE;
    } else {
      shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    }

    let discount = 0;
    if (coupon && subtotal > 0) {
      if (coupon === 'ZYLO10') discount = +(subtotal * 0.1).toFixed(2);
      if (coupon === 'ZYLO20') discount = +(subtotal * 0.2).toFixed(2);
      if (coupon === 'WELCOME5') discount = Math.min(5, subtotal);
      if (coupon === 'FREESHIP') shippingFee = 0;
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
      appliedCoupon: coupon || null,
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

    // 7. Remove purchased items from Cart
    const purchasedItemIds = new Set(selectedCartItems.map((i) => i._id));
    cart.items = cart.items.filter((i) => !purchasedItemIds.has(i._id));
    cart.appliedCoupon = null;
    await cart.save();

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
    return order;
  }
}
