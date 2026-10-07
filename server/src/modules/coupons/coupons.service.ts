import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import {
  Coupon,
  CouponDiscountType,
  CouponDocument,
} from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountAmount: number;
  isFreeShipping: boolean;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  message?: string;
  coupon?: CouponDocument;
}

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultCoupons();
  }

  /** Seed default system coupons if database is empty */
  private async seedDefaultCoupons() {
    try {
      const count = await this.couponModel.countDocuments();
      if (count > 0) return;

      const defaults: Partial<Coupon>[] = [
        {
          code: 'ZYLO10',
          description: '10% off on all eligible store products with no minimum spend',
          discountType: CouponDiscountType.PERCENTAGE,
          discountValue: 10,
          minOrderAmount: 0,
          maxDiscountAmount: 50,
          startDate: new Date('2026-01-01'),
          endDate: new Date('2027-12-31'),
          usageLimit: 10000,
          perUserLimit: 5,
          usedCount: 0,
          isActive: true,
        },
        {
          code: 'ZYLO20',
          description: '20% off on orders above $50. Capped at $40 discount',
          discountType: CouponDiscountType.PERCENTAGE,
          discountValue: 20,
          minOrderAmount: 50,
          maxDiscountAmount: 40,
          startDate: new Date('2026-01-01'),
          endDate: new Date('2027-12-31'),
          usageLimit: 5000,
          perUserLimit: 3,
          usedCount: 0,
          isActive: true,
        },
        {
          code: 'WELCOME5',
          description: 'Flat $5 instant welcome credit for new and returning shoppers',
          discountType: CouponDiscountType.FIXED,
          discountValue: 5,
          minOrderAmount: 20,
          maxDiscountAmount: null,
          startDate: new Date('2026-01-01'),
          endDate: new Date('2027-12-31'),
          usageLimit: 20000,
          perUserLimit: 1,
          usedCount: 0,
          isActive: true,
        },
        {
          code: 'FREESHIP',
          description: 'Complimentary standard shipping waiver on orders over $30',
          discountType: CouponDiscountType.FREE_SHIPPING,
          discountValue: 0,
          minOrderAmount: 30,
          maxDiscountAmount: null,
          startDate: new Date('2026-01-01'),
          endDate: new Date('2027-12-31'),
          usageLimit: 5000,
          perUserLimit: 2,
          usedCount: 0,
          isActive: true,
        },
        {
          code: 'FLASH50',
          description: 'Flash Super Deal: Flat $50 off on premier orders over $250',
          discountType: CouponDiscountType.FIXED,
          discountValue: 50,
          minOrderAmount: 250,
          maxDiscountAmount: null,
          startDate: new Date('2026-01-01'),
          endDate: new Date('2027-12-31'),
          usageLimit: 1000,
          perUserLimit: 1,
          usedCount: 0,
          isActive: true,
        },
      ];

      await this.couponModel.insertMany(defaults);
      this.logger.log(`Seeded ${defaults.length} default promotional coupons.`);
    } catch (err: any) {
      this.logger.error(`Error seeding default coupons: ${err.message}`);
    }
  }

  /** Create a new coupon */
  async create(dto: CreateCouponDto): Promise<CouponDocument> {
    const cleanCode = dto.code.trim().toUpperCase();
    const existing = await this.couponModel.findOne({ code: cleanCode });
    if (existing) {
      throw new ConflictException(`Coupon code "${cleanCode}" already exists`);
    }

    const created = new this.couponModel({
      ...dto,
      code: cleanCode,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    return created.save();
  }

  /** Find coupons with search, type filter, status filter, and pagination */
  async findAll(query: QueryCouponDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};
    const now = new Date();

    if (query.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ code: regex }, { description: regex }];
    }

    if (query.discountType) {
      filter.discountType = query.discountType;
    }

    if (query.status) {
      const s = query.status.toUpperCase();
      if (s === 'ACTIVE') {
        filter.isActive = true;
        filter.$and = [
          { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
        ];
      } else if (s === 'INACTIVE') {
        filter.isActive = false;
      } else if (s === 'EXPIRED') {
        filter.endDate = { $lt: now };
      }
    }

    const [items, total] = await Promise.all([
      this.couponModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.couponModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Metrics and KPI statistics for coupons dashboard */
  async getStats() {
    const now = new Date();
    const [total, active, expired, redemptionsAgg] = await Promise.all([
      this.couponModel.countDocuments(),
      this.couponModel.countDocuments({
        isActive: true,
        $or: [{ endDate: null }, { endDate: { $gte: now } }],
      }),
      this.couponModel.countDocuments({ endDate: { $lt: now } }),
      this.couponModel.aggregate([
        {
          $group: {
            _id: null,
            totalRedemptions: { $sum: '$usedCount' },
          },
        },
      ]),
    ]);

    const totalRedemptions = redemptionsAgg[0]?.totalRedemptions || 0;

    return {
      totalCoupons: total,
      activeCoupons: active,
      expiredCoupons: expired,
      inactiveCoupons: Math.max(0, total - active - expired),
      totalRedemptions,
    };
  }

  /** Find coupon by ID */
  async findOne(id: string): Promise<CouponDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid coupon ID');
    }
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  /** Find coupon by Code */
  async findByCode(code: string): Promise<CouponDocument | null> {
    return this.couponModel.findOne({ code: code.trim().toUpperCase() });
  }

  /** Update coupon */
  async update(id: string, dto: UpdateCouponDto): Promise<CouponDocument> {
    const coupon = await this.findOne(id);

    if (dto.code && dto.code.trim().toUpperCase() !== coupon.code) {
      const cleanCode = dto.code.trim().toUpperCase();
      const existing = await this.couponModel.findOne({
        code: cleanCode,
        _id: { $ne: coupon._id },
      });
      if (existing) {
        throw new ConflictException(`Coupon code "${cleanCode}" already exists`);
      }
      coupon.code = cleanCode;
    }

    if (dto.description !== undefined) coupon.description = dto.description;
    if (dto.discountType !== undefined) coupon.discountType = dto.discountType;
    if (dto.discountValue !== undefined) coupon.discountValue = dto.discountValue;
    if (dto.minOrderAmount !== undefined) coupon.minOrderAmount = dto.minOrderAmount;
    if (dto.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = dto.maxDiscountAmount;
    if (dto.startDate !== undefined) coupon.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) coupon.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.usageLimit !== undefined) coupon.usageLimit = dto.usageLimit;
    if (dto.perUserLimit !== undefined) coupon.perUserLimit = dto.perUserLimit;
    if (dto.isActive !== undefined) coupon.isActive = dto.isActive;

    return coupon.save();
  }

  /** Toggle active status */
  async toggleStatus(id: string, explicitStatus?: boolean): Promise<CouponDocument> {
    const coupon = await this.findOne(id);
    coupon.isActive = explicitStatus !== undefined ? explicitStatus : !coupon.isActive;
    return coupon.save();
  }

  /** Delete coupon */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const coupon = await this.findOne(id);
    await this.couponModel.findByIdAndDelete(coupon._id);
    return { success: true, message: `Coupon "${coupon.code}" deleted successfully` };
  }

  /**
   * Complete Server-side coupon verification engine.
   * Validates code, active status, start/end dates, order subtotal minimums, global usage limits, and per-user limits.
   */
  async validateCoupon(
    rawCode: string,
    subtotal: number,
    userId?: string,
  ): Promise<CouponValidationResult> {
    const code = (rawCode || '').trim().toUpperCase();
    if (!code) {
      throw new BadRequestException('Coupon code is required');
    }

    const coupon = await this.couponModel.findOne({ code });
    if (!coupon) {
      return {
        isValid: false,
        code,
        discountType: CouponDiscountType.PERCENTAGE,
        discountValue: 0,
        discountAmount: 0,
        isFreeShipping: false,
        minOrderAmount: 0,
        message: `Promo code "${code}" is invalid or does not exist`,
      };
    }

    // 1. Is active check
    if (!coupon.isActive) {
      return {
        isValid: false,
        code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: 0,
        isFreeShipping: false,
        minOrderAmount: coupon.minOrderAmount,
        message: `Promo code "${code}" is currently disabled`,
      };
    }

    // 2. Date windows
    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      return {
        isValid: false,
        code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: 0,
        isFreeShipping: false,
        minOrderAmount: coupon.minOrderAmount,
        message: `Promo code "${code}" has not started yet`,
      };
    }

    if (coupon.endDate && now > new Date(coupon.endDate)) {
      return {
        isValid: false,
        code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: 0,
        isFreeShipping: false,
        minOrderAmount: coupon.minOrderAmount,
        message: `Promo code "${code}" expired on ${new Date(coupon.endDate).toLocaleDateString()}`,
      };
    }

    // 3. Global usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        isValid: false,
        code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: 0,
        isFreeShipping: false,
        minOrderAmount: coupon.minOrderAmount,
        message: `Promo code "${code}" has reached its maximum global redemptions`,
      };
    }

    // 4. Per-user limit
    if (userId && Types.ObjectId.isValid(userId)) {
      const userUsageRecord = coupon.userUsage?.find(
        (u) => u.userId.toString() === userId,
      );
      if (userUsageRecord && userUsageRecord.count >= (coupon.perUserLimit || 1)) {
        return {
          isValid: false,
          code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: 0,
          isFreeShipping: false,
          minOrderAmount: coupon.minOrderAmount,
          message: `You have already redeemed promo code "${code}" the maximum allowable times (${coupon.perUserLimit})`,
        };
      }
    }

    // 5. Minimum spend
    const currentSubtotal = Math.max(0, Number(subtotal) || 0);
    if (coupon.minOrderAmount > 0 && currentSubtotal < coupon.minOrderAmount) {
      return {
        isValid: false,
        code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: 0,
        isFreeShipping: false,
        minOrderAmount: coupon.minOrderAmount,
        message: `Promo code "${code}" requires a minimum order of $${coupon.minOrderAmount.toFixed(2)} (current subtotal: $${currentSubtotal.toFixed(2)})`,
      };
    }

    // 6. Discount calculation
    let discountAmount = 0;
    let isFreeShipping = false;

    if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
      const calculated = (currentSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(calculated, coupon.maxDiscountAmount);
      } else {
        discountAmount = calculated;
      }
      discountAmount = Math.min(discountAmount, currentSubtotal);
    } else if (coupon.discountType === CouponDiscountType.FIXED) {
      discountAmount = Math.min(coupon.discountValue, currentSubtotal);
    } else if (coupon.discountType === CouponDiscountType.FREE_SHIPPING) {
      discountAmount = 0;
      isFreeShipping = true;
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      isValid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      isFreeShipping,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      coupon,
      message: `Coupon "${coupon.code}" applied successfully!`,
    };
  }

  /**
   * Atomically increment coupon usedCount and user usage on successful order checkout.
   */
  async recordUsage(
    rawCode: string,
    userId?: string,
    session?: ClientSession,
  ): Promise<void> {
    const code = (rawCode || '').trim().toUpperCase();
    if (!code) return;

    const coupon = await this.couponModel.findOne({ code }).session(session || null);
    if (!coupon) return;

    coupon.usedCount = (coupon.usedCount || 0) + 1;

    if (userId && Types.ObjectId.isValid(userId)) {
      const userObjId = new Types.ObjectId(userId);
      const existingUserUsage = coupon.userUsage?.find(
        (u) => u.userId.toString() === userId,
      );
      if (existingUserUsage) {
        existingUserUsage.count += 1;
      } else {
        if (!coupon.userUsage) coupon.userUsage = [];
        coupon.userUsage.push({ userId: userObjId, count: 1 });
      }
    }

    await coupon.save({ session: session || undefined });
  }

  /** Public list of active promotional coupons (e.g., for promotion banner or checkout suggestions) */
  async getActivePublicCoupons(): Promise<Partial<Coupon>[]> {
    const now = new Date();
    return this.couponModel
      .find({
        isActive: true,
        $or: [{ startDate: null }, { startDate: { $lte: now } }],
        $and: [{ $or: [{ endDate: null }, { endDate: { $gte: now } }] }],
      })
      .select('code description discountType discountValue minOrderAmount maxDiscountAmount endDate')
      .sort({ discountValue: -1 })
      .limit(6)
      .lean();
  }
}
