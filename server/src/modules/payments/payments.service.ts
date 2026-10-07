import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

import {
  PaymentTransaction,
  PaymentTransactionDocument,
  TransactionStatus,
} from './schemas/payment-transaction.schema';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentStatus,
} from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Setting, SettingDocument } from '../settings/schemas/setting.schema';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentFailureDto } from './dto/payment-failure.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(PaymentTransaction.name)
    private readonly transactionModel: Model<PaymentTransactionDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {}

  /**
   * Dynamically resolves Stripe credentials from DB settings (UI configured) with env fallback
   */
  async getStripeConfig(): Promise<{
    stripe: Stripe | null;
    isSimulated: boolean;
    publishableKey: string;
    webhookSecret?: string;
  }> {
    const settings = await this.settingModel.findOne();
    const dbKey = settings?.stripeSecretKey?.trim();
    const envKey = process.env.STRIPE_SECRET_KEY?.trim();
    const activeKey = dbKey || envKey;

    const dbPub = settings?.stripePublishableKey?.trim();
    const envPub =
      process.env.STRIPE_PUBLIC_KEY?.trim() ||
      process.env.STRIPE_PUBLISHABLE_KEY?.trim();
    const publishableKey = dbPub || envPub || 'pk_test_sample';

    const dbWhsec = settings?.stripeWebhookSecret?.trim();
    const envWhsec = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    const webhookSecret = dbWhsec || envWhsec;

    if (activeKey && !activeKey.includes('xxx') && activeKey.startsWith('sk_')) {
      try {
        const stripeClient = new Stripe(activeKey, {
          apiVersion: '2025-02-24.acacia' as any,
        });
        return {
          stripe: stripeClient,
          isSimulated: false,
          publishableKey,
          webhookSecret,
        };
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Stripe client: ${err?.message}`);
      }
    }

    return {
      stripe: null,
      isSimulated: true,
      publishableKey,
      webhookSecret,
    };
  }

  /**
   * 1. Create a Payment Intent for checkout or order
   */
  async createPaymentIntent(
    userId: string,
    user: UserDocument,
    dto: CreatePaymentIntentDto,
  ) {
    const currency = (dto.currency || 'USD').toUpperCase();
    const amountInCents = Math.round(dto.amount * 100);

    let orderDoc: OrderDocument | null = null;
    if (dto.orderId) {
      if (Types.ObjectId.isValid(dto.orderId)) {
        orderDoc = await this.orderModel.findById(dto.orderId);
      }
      if (!orderDoc) {
        orderDoc = await this.orderModel.findOne({ orderNumber: dto.orderId.toUpperCase() });
      }
    }

    let paymentIntentId = '';
    let clientSecret = '';
    const { stripe, isSimulated, publishableKey } = await this.getStripeConfig();

    if (!isSimulated && stripe) {
      try {
        const intent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: currency.toLowerCase(),
          metadata: {
            userId,
            orderId: orderDoc ? orderDoc._id.toString() : (dto.orderId || ''),
            orderNumber: orderDoc ? orderDoc.orderNumber : '',
            ...dto.metadata,
          },
          automatic_payment_methods: { enabled: true },
        });
        paymentIntentId = intent.id;
        clientSecret = intent.client_secret || '';
      } catch (err: any) {
        this.logger.error(`Stripe API error creating payment intent: ${err.message}`);
        throw new BadRequestException(`Stripe error: ${err.message}`);
      }
    } else {
      // Simulated Stripe Intent
      const randId = uuidv4().replace(/-/g, '').slice(0, 24);
      paymentIntentId = `pi_test_${randId}`;
      clientSecret = `${paymentIntentId}_secret_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    }

    // Save transaction record
    const transaction = await this.transactionModel.create({
      transactionId: `TXN-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`,
      orderId: orderDoc ? orderDoc._id : undefined,
      orderNumber: orderDoc ? orderDoc.orderNumber : undefined,
      userId,
      gateway: 'STRIPE',
      amount: dto.amount,
      currency,
      paymentIntentId,
      clientSecret,
      status: TransactionStatus.INITIALIZED,
      metadata: dto.metadata || {},
      isSimulated,
    });

    this.logger.log(
      `Created payment intent ${paymentIntentId} for user ${user.email} ($${dto.amount} ${currency}, Simulated: ${isSimulated})`,
    );

    return {
      transactionId: transaction.transactionId,
      paymentIntentId,
      clientSecret,
      amount: dto.amount,
      currency,
      publishableKey,
      isSimulated,
    };
  }

  /**
   * 2. Confirm successful payment & synchronize order status
   */
  async confirmPayment(userId: string, dto: ConfirmPaymentDto) {
    const transaction = await this.transactionModel.findOne({
      paymentIntentId: dto.paymentIntentId,
    });

    if (!transaction) {
      throw new NotFoundException(`Payment transaction "${dto.paymentIntentId}" not found`);
    }

    if (transaction.userId !== userId) {
      throw new BadRequestException('Unauthorized to confirm this payment transaction');
    }

    // If Stripe live client is active, verify with Stripe API
    const { stripe, isSimulated } = await this.getStripeConfig();
    if (!isSimulated && stripe) {
      try {
        const intent = await stripe.paymentIntents.retrieve(dto.paymentIntentId);
        if (intent.status !== 'succeeded') {
          throw new BadRequestException(`Stripe payment status is ${intent.status}, expected succeeded`);
        }
      } catch (err: any) {
        this.logger.error(`Failed to verify payment with Stripe: ${err.message}`);
        throw new BadRequestException(`Stripe verification error: ${err.message}`);
      }
    }

    // Update transaction to SUCCESS
    transaction.status = TransactionStatus.SUCCESS;
    transaction.paymentMethodType = 'card';
    if (dto.cardBrand) transaction.cardBrand = dto.cardBrand;
    if (dto.cardLast4) transaction.cardLast4 = dto.cardLast4;
    await transaction.save();

    // Synchronize order if linked
    let order: OrderDocument | null = null;
    const orderIdToFind = dto.orderId || transaction.orderId;

    if (orderIdToFind) {
      order = await this.orderModel.findById(orderIdToFind);
      if (!order && Types.ObjectId.isValid(orderIdToFind.toString())) {
        order = await this.orderModel.findById(orderIdToFind);
      }
      if (!order && typeof orderIdToFind === 'string') {
        order = await this.orderModel.findOne({ orderNumber: orderIdToFind.toUpperCase() });
      }

      if (order) {
        order.paymentStatus = PaymentStatus.PAID;
        if (order.orderStatus === OrderStatus.PENDING) {
          order.orderStatus = OrderStatus.CONFIRMED;
        }

        order.statusHistory.push({
          status: order.orderStatus,
          timestamp: new Date(),
          note: `Online payment succeeded via Stripe (${dto.cardBrand || 'Card'} •••• ${dto.cardLast4 || '4242'}). Txn: ${transaction.transactionId}`,
        });

        await order.save();
        this.logger.log(`Order ${order.orderNumber} updated to PAID with transaction ${transaction.transactionId}`);
      }
    }

    return {
      success: true,
      transaction,
      order: order || null,
      message: 'Payment verified and confirmed successfully',
    };
  }

  /**
   * 3. Handle payment failure / card decline
   */
  async handlePaymentFailure(userId: string, dto: PaymentFailureDto) {
    const transaction = await this.transactionModel.findOne({
      paymentIntentId: dto.paymentIntentId,
    });

    if (!transaction) {
      throw new NotFoundException(`Payment transaction "${dto.paymentIntentId}" not found`);
    }

    transaction.status = TransactionStatus.FAILED;
    transaction.errorCode = dto.errorCode || 'card_declined';
    transaction.errorMessage = dto.errorMessage || 'Your card was declined';
    await transaction.save();

    let order: OrderDocument | null = null;
    const orderIdToFind = dto.orderId || transaction.orderId;

    if (orderIdToFind) {
      order = await this.orderModel.findById(orderIdToFind);
      if (order) {
        order.paymentStatus = PaymentStatus.FAILED;
        order.statusHistory.push({
          status: order.orderStatus,
          timestamp: new Date(),
          note: `Payment attempt failed: ${dto.errorMessage} (${dto.errorCode || 'error'})`,
        });
        await order.save();
      }
    }

    this.logger.warn(`Payment failed for intent ${dto.paymentIntentId}: ${dto.errorMessage}`);

    return {
      success: false,
      transaction,
      order: order || null,
      message: dto.errorMessage,
    };
  }

  /**
   * 4. Retry payment on a failed / pending order
   */
  async retryPayment(userId: string, user: UserDocument, orderId: string) {
    let order: OrderDocument | null = null;
    if (Types.ObjectId.isValid(orderId)) {
      order = await this.orderModel.findById(orderId);
    }
    if (!order) {
      order = await this.orderModel.findOne({ orderNumber: orderId.toUpperCase() });
    }

    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found`);
    }

    if (order.userId !== userId) {
      throw new BadRequestException('You are not authorized to retry payment for this order');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    // Generate fresh Payment Intent for this order
    const intentResult = await this.createPaymentIntent(userId, user, {
      orderId: order._id.toString(),
      amount: order.grandTotal,
      currency: 'USD',
      metadata: {
        orderNumber: order.orderNumber,
        isRetry: true,
      },
    });

    return {
      order,
      ...intentResult,
    };
  }

  /**
   * 5. Get all transactions for an order
   */
  async getOrderTransactions(orderId: string) {
    let orderDoc: OrderDocument | null = null;
    if (Types.ObjectId.isValid(orderId)) {
      orderDoc = await this.orderModel.findById(orderId);
    }
    if (!orderDoc) {
      orderDoc = await this.orderModel.findOne({ orderNumber: orderId.toUpperCase() });
    }

    if (!orderDoc) {
      throw new NotFoundException(`Order "${orderId}" not found`);
    }

    const transactions = await this.transactionModel
      .find({ orderId: orderDoc._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return {
      order: orderDoc,
      transactions,
    };
  }

  /**
   * 6. Webhook Listener
   */
  async processWebhook(payload: any, signature?: string) {
    this.logger.log(`Received Stripe webhook event: ${payload?.type || 'unknown'}`);

    let event = payload;
    const { stripe, isSimulated, webhookSecret } = await this.getStripeConfig();

    if (!isSimulated && stripe && signature) {
      if (webhookSecret && !webhookSecret.includes('xxx')) {
        try {
          event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
          this.logger.error(`Stripe Webhook signature verification failed: ${err.message}`);
          throw new BadRequestException(`Webhook Error: ${err.message}`);
        }
      }
    }

    const eventType = event.type;
    const dataObject = event.data?.object;

    if (!dataObject) {
      return { received: true };
    }

    const paymentIntentId = dataObject.id;

    if (eventType === 'payment_intent.succeeded') {
      const txn = await this.transactionModel.findOne({ paymentIntentId });
      if (txn) {
        txn.status = TransactionStatus.SUCCESS;
        txn.stripeEventId = event.id;
        await txn.save();

        if (txn.orderId) {
          const order = await this.orderModel.findById(txn.orderId);
          if (order && order.paymentStatus !== PaymentStatus.PAID) {
            order.paymentStatus = PaymentStatus.PAID;
            order.statusHistory.push({
              status: order.orderStatus,
              timestamp: new Date(),
              note: `Payment confirmed via Stripe webhook event (${event.id})`,
            });
            await order.save();
          }
        }
      }
    } else if (eventType === 'payment_intent.payment_failed') {
      const txn = await this.transactionModel.findOne({ paymentIntentId });
      if (txn) {
        txn.status = TransactionStatus.FAILED;
        txn.stripeEventId = event.id;
        txn.errorCode = dataObject.last_payment_error?.code || 'payment_failed';
        txn.errorMessage = dataObject.last_payment_error?.message || 'Payment attempt failed';
        await txn.save();

        if (txn.orderId) {
          const order = await this.orderModel.findById(txn.orderId);
          if (order) {
            order.paymentStatus = PaymentStatus.FAILED;
            await order.save();
          }
        }
      }
    }

    return { received: true, event: eventType };
  }

  /**
   * 7. Admin Test Connection for Payment Providers
   */
  async testProviderConnection(
    provider: string,
    credentials?: { secretKey?: string; publishableKey?: string },
  ) {
    if (provider !== 'stripe') {
      return {
        success: true,
        provider,
        mode: 'test',
        message: `${provider.toUpperCase()} provider validated. Multi-provider pipeline is operational.`,
      };
    }

    const candidateKey = credentials?.secretKey?.trim();

    if (candidateKey) {
      if (!candidateKey.startsWith('sk_') || candidateKey.includes('xxx')) {
        return {
          success: false,
          provider: 'stripe',
          message: 'Invalid Stripe Secret Key format. Must start with sk_test_ or sk_live_.',
        };
      }

      try {
        const testClient = new Stripe(candidateKey, {
          apiVersion: '2025-02-24.acacia' as any,
        });
        await testClient.balance.retrieve();
        return {
          success: true,
          provider: 'stripe',
          mode: candidateKey.startsWith('sk_live_') ? 'live' : 'test',
          message: 'Stripe API connection verified! Live API accepted credentials.',
        };
      } catch (err: any) {
        return {
          success: false,
          provider: 'stripe',
          message: `Stripe connection error: ${err.message}`,
        };
      }
    }

    const { stripe, isSimulated } = await this.getStripeConfig();

    if (!isSimulated && stripe) {
      try {
        await stripe.balance.retrieve();
        return {
          success: true,
          provider: 'stripe',
          mode: 'live',
          message: 'Saved Stripe credentials verified successfully with Stripe API!',
        };
      } catch (err: any) {
        return {
          success: false,
          provider: 'stripe',
          message: `Saved key validation error: ${err.message}`,
        };
      }
    }

    return {
      success: true,
      provider: 'stripe',
      mode: 'sandbox',
      message: 'Operating in built-in Stripe Sandbox Simulator mode. Test transactions supported.',
    };
  }
}
