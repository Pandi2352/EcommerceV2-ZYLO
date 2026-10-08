import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import {
  AbandonedCart,
  AbandonedCartDocument,
  AbandonedCartStage,
  AbandonedCartStatus,
} from './schemas/abandoned-cart.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { MailService } from '../mail/mail.service';
import { appConfig, AppConfig } from '../../config/app.config';
import { abandonedCartRecoveryEmailTemplate } from './templates/abandoned-cart-email.template';

export interface AbandonedCartQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  stage?: AbandonedCartStage;
  status?: AbandonedCartStatus;
}

@Injectable()
export class AbandonedCartsService {
  private readonly logger = new Logger(AbandonedCartsService.name);

  constructor(
    @InjectModel(AbandonedCart.name)
    private readonly abandonedCartModel: Model<AbandonedCartDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly mailService: MailService,
    @Inject(appConfig.KEY)
    private readonly app: AppConfig,
  ) {}

  /**
   * Recurring cron: runs every 30 minutes to evaluate idle carts and dispatch sequence emails.
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleScheduledRecovery() {
    this.logger.log('Starting automated abandoned carts recovery evaluation job...');
    const result = await this.processAbandonedCarts();
    this.logger.log(`Recovery job completed: processed ${result.processedCount} carts, sent ${result.emailsSent} emails.`);
  }

  /**
   * Manual trigger callable from the Admin UI to run the engine on-demand.
   */
  async runManualJob() {
    return this.processAbandonedCarts();
  }

  /**
   * Core recovery sequence logic:
   * 1. Scans active carts with items
   * 2. Checks time since last cart update
   * 3. Determines eligibility for Stage 1 (1h), Stage 2 (24h), Stage 3 (72h)
   * 4. Dispatches personalized recovery emails with 1-click restore links
   */
  async processAbandonedCarts(): Promise<{ processedCount: number; emailsSent: number; errors: number }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    // Find all carts with items that haven't been touched in over 1 hour
    const idleCarts = await this.cartModel.find({
      'items.0': { $exists: true },
      updatedAt: { $lte: oneHourAgo },
    }).exec();

    let processedCount = 0;
    let emailsSent = 0;
    let errors = 0;

    for (const cart of idleCarts) {
      try {
        processedCount++;
        const userId = cart.userId;
        const user = await this.userModel.findById(userId).exec();
        if (!user || !user.email) continue;

        // Check if an order was placed by this user after the cart's last update
        const recentOrder = await this.orderModel.findOne({
          userId,
          createdAt: { $gte: (cart as any).updatedAt },
        }).exec();

        if (recentOrder) {
          // User already bought items after this cart state
          continue;
        }

        // Find or create tracking record
        let record = await this.abandonedCartModel.findOne({
          cartId: cart._id.toString(),
          status: { $in: [AbandonedCartStatus.ABANDONED] },
        }).exec();

        const cartUpdatedAt = new Date((cart as any).updatedAt);

        // Fetch products to snapshot items & calculate accurate totals
        const itemSnapshots = [];
        let subtotal = 0;

        for (const it of cart.items) {
          const product = await this.productModel.findById(it.productId).exec();
          if (product) {
            const price = product.salePrice ?? product.basePrice;
            const primaryImg =
              product.images?.find((img) => img.isPrimary)?.url ||
              product.images?.[0]?.url ||
              '';

            itemSnapshots.push({
              productId: product._id.toString(),
              name: product.name,
              slug: product.slug,
              imageUrl: primaryImg,
              price,
              quantity: it.quantity,
              variantSku: it.variantSku || null,
            });

            subtotal += price * it.quantity;
          }
        }

        if (itemSnapshots.length === 0) continue;

        const cartTotal = +subtotal.toFixed(2);
        const itemCount = itemSnapshots.reduce((acc, i) => acc + i.quantity, 0);

        if (!record) {
          record = new this.abandonedCartModel({
            _id: uuidv4(),
            cartId: cart._id.toString(),
            userId,
            customerEmail: user.email,
            customerName: user.name || 'Valued Shopper',
            cartTotal,
            subtotal,
            itemCount,
            items: itemSnapshots,
            recoveryToken: uuidv4(),
            stage: AbandonedCartStage.STAGE_1_REMINDER,
            status: AbandonedCartStatus.ABANDONED,
            lastActivityAt: cartUpdatedAt,
          });
        } else {
          // Update items & totals to latest cart state
          record.items = itemSnapshots;
          record.cartTotal = cartTotal;
          record.subtotal = subtotal;
          record.itemCount = itemCount;
          record.lastActivityAt = cartUpdatedAt;
        }

        // Evaluate Stage Sequence Progression
        let shouldSendEmail = false;

        if (cartUpdatedAt <= seventyTwoHoursAgo && !record.stage3SentAt) {
          // Stage 3: Final Reminder with 15% discount
          record.stage = AbandonedCartStage.STAGE_3_FINAL;
          record.discountCouponCode = 'FINAL15';
          record.stage3SentAt = now;
          record.emailsSentCount = (record.emailsSentCount || 0) + 1;
          shouldSendEmail = true;
        } else if (cartUpdatedAt <= twentyFourHoursAgo && !record.stage2SentAt) {
          // Stage 2: 24h Reminder with 10% discount
          record.stage = AbandonedCartStage.STAGE_2_DISCOUNT;
          record.discountCouponCode = 'COMEBACK10';
          record.stage2SentAt = now;
          record.emailsSentCount = (record.emailsSentCount || 0) + 1;
          shouldSendEmail = true;
        } else if (cartUpdatedAt <= oneHourAgo && !record.stage1SentAt) {
          // Stage 1: 1h Friendly Reminder
          record.stage = AbandonedCartStage.STAGE_1_REMINDER;
          record.stage1SentAt = now;
          record.emailsSentCount = (record.emailsSentCount || 0) + 1;
          shouldSendEmail = true;
        }

        await record.save();

        if (shouldSendEmail) {
          const clientUrl = this.app.clientUrl || 'http://localhost:5176';
          const emailMessage = abandonedCartRecoveryEmailTemplate(
            'ZYLO',
            clientUrl,
            record,
            '$',
          );

          this.mailService.sendInBackground({
            to: record.customerEmail,
            ...emailMessage,
          });

          emailsSent++;
        }
      } catch (err: any) {
        errors++;
        this.logger.error(`Error processing abandoned cart ${cart._id}: ${err.message}`, err.stack);
      }
    }

    return { processedCount, emailsSent, errors };
  }

  /**
   * 1-Click Cart Restore Handler:
   * Called when customer clicks recovery link in email.
   * Restores items into active session cart and returns applied coupon!
   */
  async restoreCartByToken(token: string) {
    const record = await this.abandonedCartModel.findOne({ recoveryToken: token }).exec();
    if (!record) {
      throw new NotFoundException('Invalid or expired cart recovery link');
    }

    if (record.status === AbandonedCartStatus.RECOVERED) {
      return {
        success: true,
        alreadyRecovered: true,
        message: 'This cart was already completed!',
        cartTotal: record.cartTotal,
        items: record.items,
        coupon: record.discountCouponCode,
      };
    }

    // Restore items to user cart in DB
    const cart = await this.cartModel.findOne({ userId: record.userId }).exec();
    if (cart) {
      const existingProductIds = new Set(cart.items.map((i) => i.productId.toString()));
      for (const item of record.items) {
        if (!existingProductIds.has(item.productId)) {
          cart.items.push({
            _id: uuidv4(),
            productId: item.productId as any,
            variantSku: item.variantSku || null,
            quantity: item.quantity,
            selected: true,
            addedAt: new Date(),
          });
        }
      }
      if (record.discountCouponCode) {
        cart.appliedCoupon = record.discountCouponCode;
      }
      await cart.save();
    }

    return {
      success: true,
      message: 'Cart restored successfully! Items and promo coupon are ready for checkout.',
      cartId: record.cartId,
      items: record.items,
      cartTotal: record.cartTotal,
      coupon: record.discountCouponCode,
      customerEmail: record.customerEmail,
    };
  }

  /**
   * Called when an order is completed: marks corresponding abandoned cart as RECOVERED!
   */
  async markRecovered(userId: string, orderNumber: string, revenue: number) {
    const record = await this.abandonedCartModel.findOne({
      userId,
      status: AbandonedCartStatus.ABANDONED,
    }).sort({ updatedAt: -1 }).exec();

    if (record) {
      record.status = AbandonedCartStatus.RECOVERED;
      record.stage = AbandonedCartStage.RECOVERED;
      record.recoveredAt = new Date();
      record.recoveredOrderId = orderNumber;
      record.recoveredRevenue = revenue;
      await record.save();
      this.logger.log(`Abandoned cart ${record._id} successfully marked as RECOVERED with order ${orderNumber}!`);
    }
  }

  /**
   * Admin: Get aggregated KPI metrics for the Abandoned Carts Dashboard
   */
  async getMetrics() {
    const [totalAbandoned, recoveredCount, stageStats, valueAgg] = await Promise.all([
      this.abandonedCartModel.countDocuments(),
      this.abandonedCartModel.countDocuments({ status: AbandonedCartStatus.RECOVERED }),
      this.abandonedCartModel.aggregate([
        { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$cartTotal' } } },
      ]),
      this.abandonedCartModel.aggregate([
        {
          $group: {
            _id: '$status',
            totalValue: { $sum: '$cartTotal' },
            recoveredRevenue: { $sum: '$recoveredRevenue' },
            emailsSent: { $sum: '$emailsSentCount' },
          },
        },
      ]),
    ]);

    let abandonedCartValue = 0;
    let totalRecoveredRevenue = 0;
    let totalEmailsSent = 0;

    valueAgg.forEach((v) => {
      if (v._id === AbandonedCartStatus.ABANDONED) {
        abandonedCartValue += v.totalValue || 0;
      }
      if (v._id === AbandonedCartStatus.RECOVERED) {
        totalRecoveredRevenue += v.recoveredRevenue || v.totalValue || 0;
      }
      totalEmailsSent += v.emailsSent || 0;
    });

    const conversionRate =
      totalAbandoned > 0 ? +((recoveredCount / totalAbandoned) * 100).toFixed(1) : 0;

    return {
      totalAbandoned,
      abandonedCartValue: +abandonedCartValue.toFixed(2),
      recoveredCount,
      recoveredRevenue: +totalRecoveredRevenue.toFixed(2),
      conversionRate,
      totalEmailsSent,
      stageStats: stageStats.reduce((acc, curr) => {
        acc[curr._id] = { count: curr.count, value: +curr.totalValue.toFixed(2) };
        return acc;
      }, {}),
    };
  }

  /**
   * Admin: List abandoned carts with filters, search, and pagination
   */
  async findAllAdmin(query: AbandonedCartQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.stage) {
      filter.stage = query.stage;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search?.trim()) {
      const term = query.search.trim();
      filter.$or = [
        { customerEmail: { $regex: term, $options: 'i' } },
        { customerName: { $regex: term, $options: 'i' } },
        { 'items.name': { $regex: term, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.abandonedCartModel
        .find(filter)
        .sort({ lastActivityAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.abandonedCartModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Admin: Manually trigger an immediate recovery email for a single cart
   */
  async sendManualEmail(id: string) {
    const record = await this.abandonedCartModel.findById(id).exec();
    if (!record) throw new NotFoundException('Abandoned cart record not found');

    const clientUrl = this.app.clientUrl || 'http://localhost:5176';
    const emailMessage = abandonedCartRecoveryEmailTemplate(
      'ZYLO',
      clientUrl,
      record,
      '$',
    );

    this.mailService.sendInBackground({
      to: record.customerEmail,
      ...emailMessage,
    });

    record.emailsSentCount = (record.emailsSentCount || 0) + 1;
    await record.save();

    return { success: true, message: `Recovery email dispatched to ${record.customerEmail}` };
  }

  /**
   * Admin: Manually toggle or mark as recovered
   */
  async markManuallyRecovered(id: string) {
    const record = await this.abandonedCartModel.findById(id).exec();
    if (!record) throw new NotFoundException('Abandoned cart record not found');

    record.status = AbandonedCartStatus.RECOVERED;
    record.stage = AbandonedCartStage.RECOVERED;
    record.recoveredAt = new Date();
    record.recoveredRevenue = record.cartTotal;
    await record.save();

    return record;
  }
}
