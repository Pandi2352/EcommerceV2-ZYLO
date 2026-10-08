import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  AbandonedCart,
  AbandonedCartDocument,
  AbandonedCartStage,
  AbandonedCartStatus,
} from './schemas/abandoned-cart.schema';

@Injectable()
export class AbandonedCartsSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AbandonedCartsSeedService.name);

  constructor(
    @InjectModel(AbandonedCart.name)
    private readonly abandonedCartModel: Model<AbandonedCartDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedInitialAbandonedCarts();
  }

  async seedInitialAbandonedCarts() {
    const count = await this.abandonedCartModel.countDocuments();
    if (count > 0) {
      this.logger.log(`Abandoned carts collection populated (${count} records). Skipping seed.`);
      return;
    }

    this.logger.log('Seeding initial realistic abandoned carts and recovered milestones...');

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000);
    const eightyHoursAgo = new Date(now.getTime() - 80 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const initialCarts = [
      {
        _id: uuidv4(),
        cartId: uuidv4(),
        userId: 'usr-sarah-jenkins',
        customerEmail: 'sarah.jenkins@example.com',
        customerName: 'Sarah Jenkins',
        cartTotal: 669.0,
        subtotal: 669.0,
        itemCount: 2,
        items: [
          {
            productId: 'prod-airpods-max',
            name: 'Apple AirPods Max - Space Gray',
            slug: 'apple-airpods-max',
            imageUrl:
              'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
            price: 549.0,
            quantity: 1,
            variantSku: 'APM-SG-01',
          },
          {
            productId: 'prod-tech-fleece',
            name: 'Nike Sportswear Tech Fleece Windrunner',
            slug: 'nike-tech-fleece-windrunner',
            imageUrl:
              'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
            price: 120.0,
            quantity: 1,
            variantSku: 'NK-TF-BLK-M',
          },
        ],
        recoveryToken: uuidv4(),
        stage: AbandonedCartStage.STAGE_1_REMINDER,
        status: AbandonedCartStatus.ABANDONED,
        stage1SentAt: twoHoursAgo,
        emailsSentCount: 1,
        lastActivityAt: twoHoursAgo,
      },
      {
        _id: uuidv4(),
        cartId: uuidv4(),
        userId: 'usr-david-miller',
        customerEmail: 'david.miller@example.com',
        customerName: 'David Miller',
        cartTotal: 1248.0,
        subtotal: 1248.0,
        itemCount: 2,
        items: [
          {
            productId: 'prod-iphone-16',
            name: 'Apple iPhone 16 Pro Max - 256GB Desert Titanium',
            slug: 'apple-iphone-16-pro-max',
            imageUrl:
              'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
            price: 1199.0,
            quantity: 1,
            variantSku: 'IPH-16PM-256-DT',
          },
          {
            productId: 'prod-magsafe-case',
            name: 'Apple MagSafe Clear Silicone Case',
            slug: 'apple-magsafe-clear-case',
            imageUrl:
              'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80',
            price: 49.0,
            quantity: 1,
            variantSku: 'AP-CASE-CLR',
          },
        ],
        recoveryToken: uuidv4(),
        discountCouponCode: 'COMEBACK10',
        stage: AbandonedCartStage.STAGE_2_DISCOUNT,
        status: AbandonedCartStatus.ABANDONED,
        stage1SentAt: new Date(thirtyHoursAgo.getTime() - 23 * 60 * 60 * 1000),
        stage2SentAt: thirtyHoursAgo,
        emailsSentCount: 2,
        lastActivityAt: thirtyHoursAgo,
      },
      {
        _id: uuidv4(),
        cartId: uuidv4(),
        userId: 'usr-emma-watson',
        customerEmail: 'emma.watson@example.com',
        customerName: 'Emma Watson',
        cartTotal: 4398.0,
        subtotal: 4398.0,
        itemCount: 2,
        items: [
          {
            productId: 'prod-sony-a7r5',
            name: 'Sony Alpha A7R V Mirrorless Camera Body',
            slug: 'sony-alpha-a7r-v',
            imageUrl:
              'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
            price: 3899.0,
            quantity: 1,
            variantSku: 'SNY-A7R5-BODY',
          },
          {
            productId: 'prod-sony-wf1000',
            name: 'Sony WF-1000XM5 Wireless Noise Canceling Earbuds',
            slug: 'sony-wf-1000xm5',
            imageUrl:
              'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
            price: 499.0,
            quantity: 1,
            variantSku: 'SNY-WF-XM5-BLK',
          },
        ],
        recoveryToken: uuidv4(),
        discountCouponCode: 'FINAL15',
        stage: AbandonedCartStage.STAGE_3_FINAL,
        status: AbandonedCartStatus.ABANDONED,
        stage1SentAt: new Date(eightyHoursAgo.getTime() - 71 * 60 * 60 * 1000),
        stage2SentAt: new Date(eightyHoursAgo.getTime() - 48 * 60 * 60 * 1000),
        stage3SentAt: eightyHoursAgo,
        emailsSentCount: 3,
        lastActivityAt: eightyHoursAgo,
      },
      {
        _id: uuidv4(),
        cartId: uuidv4(),
        userId: 'usr-michael-chang',
        customerEmail: 'michael.chang@example.com',
        customerName: 'Michael Chang',
        cartTotal: 789.0,
        subtotal: 789.0,
        itemCount: 1,
        items: [
          {
            productId: 'prod-breville-barista',
            name: 'Breville Barista Touch Espresso Machine',
            slug: 'breville-barista-touch',
            imageUrl:
              'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80',
            price: 789.0,
            quantity: 1,
            variantSku: 'BRV-BES880-SS',
          },
        ],
        recoveryToken: uuidv4(),
        discountCouponCode: 'COMEBACK10',
        stage: AbandonedCartStage.RECOVERED,
        status: AbandonedCartStatus.RECOVERED,
        stage1SentAt: new Date(fiveDaysAgo.getTime() - 24 * 60 * 60 * 1000),
        stage2SentAt: fiveDaysAgo,
        recoveredAt: new Date(fiveDaysAgo.getTime() + 4 * 60 * 60 * 1000),
        recoveredOrderId: 'ZYLO-2026-881294',
        recoveredRevenue: 789.0,
        emailsSentCount: 2,
        lastActivityAt: fiveDaysAgo,
      },
      {
        _id: uuidv4(),
        cartId: uuidv4(),
        userId: 'usr-jessica-alba',
        customerEmail: 'jessica.alba@example.com',
        customerName: 'Jessica Alba',
        cartTotal: 1199.0,
        subtotal: 1199.0,
        itemCount: 1,
        items: [
          {
            productId: 'prod-iphone-16',
            name: 'Apple iPhone 16 Pro Max - 256GB Black Titanium',
            slug: 'apple-iphone-16-pro-max',
            imageUrl:
              'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
            price: 1199.0,
            quantity: 1,
            variantSku: 'IPH-16PM-256-BT',
          },
        ],
        recoveryToken: uuidv4(),
        stage: AbandonedCartStage.RECOVERED,
        status: AbandonedCartStatus.RECOVERED,
        stage1SentAt: new Date(now.getTime() - 40 * 60 * 60 * 1000),
        recoveredAt: new Date(now.getTime() - 38 * 60 * 60 * 1000),
        recoveredOrderId: 'ZYLO-2026-449102',
        recoveredRevenue: 1199.0,
        emailsSentCount: 1,
        lastActivityAt: new Date(now.getTime() - 42 * 60 * 60 * 1000),
      },
      {
        _id: uuidv4(),
        cartId: uuidv4(),
        userId: 'usr-robert-downey',
        customerEmail: 'robert.downey@example.com',
        customerName: 'Robert Downey',
        cartTotal: 3299.0,
        subtotal: 3299.0,
        itemCount: 1,
        items: [
          {
            productId: 'prod-razer-blade',
            name: 'Razer Blade 16 Gaming Laptop - OLED 240Hz RTX 4090',
            slug: 'razer-blade-16',
            imageUrl:
              'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
            price: 3299.0,
            quantity: 1,
            variantSku: 'RZR-B16-OLED-4090',
          },
        ],
        recoveryToken: uuidv4(),
        stage: AbandonedCartStage.STAGE_1_REMINDER,
        status: AbandonedCartStatus.ABANDONED,
        stage1SentAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        emailsSentCount: 1,
        lastActivityAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
    ];

    await this.abandonedCartModel.insertMany(initialCarts);
    this.logger.log(`Successfully seeded ${initialCarts.length} abandoned cart tracking records.`);
  }
}
