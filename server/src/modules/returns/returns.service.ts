import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ReturnReason,
  ReturnRequest,
  ReturnRequestDocument,
  ReturnStatus,
} from './schemas/return-request.schema';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { ReviewReturnDto } from './dto/review-return.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { AdminReturnQueryDto } from './dto/admin-return-query.dto';

@Injectable()
export class ReturnsService {
  private readonly logger = new Logger(ReturnsService.name);

  constructor(
    @InjectModel(ReturnRequest.name)
    private readonly returnModel: Model<ReturnRequestDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Helper to generate unique return reference e.g. RET-2026-829143
   */
  private async generateReturnNumber(): Promise<string> {
    const year = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      const random = Math.floor(100000 + Math.random() * 900000);
      const returnNumber = `RET-${year}-${random}`;
      const exists = await this.returnModel.exists({ returnNumber });
      if (!exists) return returnNumber;
    }
    return `RET-${year}-${Date.now().toString().slice(-6)}`;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER RETURN ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  async createReturnRequest(
    userId: string,
    user: UserDocument,
    dto: CreateReturnRequestDto,
  ): Promise<ReturnRequestDocument> {
    // 1. Locate Order
    let order: OrderDocument | null = null;
    if (Types.ObjectId.isValid(dto.orderId)) {
      order = await this.orderModel.findById(dto.orderId).exec();
    }
    if (!order) {
      order = await this.orderModel.findOne({ orderNumber: dto.orderId.toUpperCase() }).exec();
    }

    if (!order) {
      throw new NotFoundException(`Order "${dto.orderId}" not found`);
    }

    // Verify order ownership
    if (order.userId !== userId) {
      throw new BadRequestException('You are not authorized to return items for this order');
    }

    // Check delivered status
    if (order.orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        `Returns can only be requested for delivered orders. Current order status is "${order.orderStatus}".`,
      );
    }

    // 2. Validate return items
    const returnItems: any[] = [];
    let totalRefundAmount = 0;

    for (const reqItem of dto.items) {
      const orderItem = order.items.find(
        (i) => i._id.toString() === reqItem.orderItemId || (i as any).productId?.toString() === reqItem.orderItemId,
      );

      if (!orderItem) {
        throw new NotFoundException(`Order item "${reqItem.orderItemId}" not found in this order`);
      }

      if (reqItem.quantity > orderItem.quantity) {
        throw new BadRequestException(
          `Cannot return ${reqItem.quantity} units of "${orderItem.name}". Only ${orderItem.quantity} units were purchased.`,
        );
      }

      // Check if already requested in an existing active return
      const existingReturn = await this.returnModel.findOne({
        orderId: order._id,
        'items.orderItemId': orderItem._id.toString(),
        status: { $in: [ReturnStatus.REQUESTED, ReturnStatus.APPROVED, ReturnStatus.REFUNDED] },
      });

      if (existingReturn) {
        throw new ConflictException(
          `A return request for item "${orderItem.name}" already exists (${existingReturn.returnNumber}).`,
        );
      }

      const itemRefundAmount = +(orderItem.unitPrice * reqItem.quantity).toFixed(2);
      totalRefundAmount += itemRefundAmount;

      returnItems.push({
        _id: new Types.ObjectId().toString(),
        orderItemId: orderItem._id.toString(),
        productId: orderItem.productId,
        productSlug: orderItem.productSlug,
        name: orderItem.name,
        image: orderItem.image,
        variantSku: orderItem.variantSku || null,
        variantTitle: orderItem.variantTitle || null,
        unitPrice: orderItem.unitPrice,
        quantity: reqItem.quantity,
        refundAmount: itemRefundAmount,
      });
    }

    totalRefundAmount = +totalRefundAmount.toFixed(2);
    const returnNumber = await this.generateReturnNumber();

    const returnRequest = new this.returnModel({
      returnNumber,
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId,
      customerName: user.name || order.customerName,
      customerEmail: user.email || order.customerEmail,
      items: returnItems,
      reason: dto.reason,
      customerNote: dto.customerNote || '',
      proofImages: dto.proofImages || [],
      status: ReturnStatus.REQUESTED,
      totalRefundAmount,
      statusHistory: [
        {
          status: ReturnStatus.REQUESTED,
          timestamp: new Date(),
          note: dto.customerNote || 'Customer submitted return request',
          changedBy: user.name,
        },
      ],
      restockOnApproval: true,
    });

    await returnRequest.save();

    this.logger.log(
      `Customer "${user.name}" submitted return request ${returnNumber} for Order ${order.orderNumber} ($${totalRefundAmount})`,
    );

    return returnRequest;
  }

  async getCustomerReturns(userId: string) {
    return this.returnModel.find({ userId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getCustomerReturnById(userId: string, id: string) {
    const returnReq = await this.returnModel.findOne({ _id: id, userId }).lean().exec();
    if (!returnReq) {
      throw new NotFoundException('Return request not found');
    }
    return returnReq;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ADMIN RETURNS MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  async getAdminSummary() {
    const allReturns = await this.returnModel
      .find({}, 'status totalRefundAmount')
      .lean()
      .exec();

    let totalRequests = allReturns.length;
    let pendingCount = 0;
    let approvedCount = 0;
    let refundedCount = 0;
    let rejectedCount = 0;
    let totalRefundedAmount = 0;

    for (const r of allReturns) {
      if (r.status === ReturnStatus.REQUESTED) {
        pendingCount++;
      } else if (r.status === ReturnStatus.APPROVED) {
        approvedCount++;
      } else if (r.status === ReturnStatus.REFUNDED) {
        refundedCount++;
        totalRefundedAmount += r.totalRefundAmount || 0;
      } else if (r.status === ReturnStatus.REJECTED) {
        rejectedCount++;
      }
    }

    return {
      totalRequests,
      pendingCount,
      approvedCount,
      refundedCount,
      rejectedCount,
      totalRefundedAmount: Math.round(totalRefundedAmount * 100) / 100,
    };
  }

  async getAdminReturns(query: AdminReturnQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { returnNumber: regex },
        { orderNumber: regex },
        { customerName: regex },
        { customerEmail: regex },
      ];
    }

    const sortObj: Record<string, 1 | -1> = {};
    if (query.sortBy === 'oldest') {
      sortObj.createdAt = 1;
    } else if (query.sortBy === 'amount_desc') {
      sortObj.totalRefundAmount = -1;
    } else if (query.sortBy === 'amount_asc') {
      sortObj.totalRefundAmount = 1;
    } else {
      sortObj.createdAt = -1;
    }

    const [items, total] = await Promise.all([
      this.returnModel.find(filter).sort(sortObj).skip(skip).limit(limit).lean().exec(),
      this.returnModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getAdminReturnById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID format');
    }

    const returnReq = await this.returnModel.findById(id).lean().exec();
    if (!returnReq) {
      throw new NotFoundException(`Return request with ID "${id}" not found`);
    }

    const order = await this.orderModel.findById(returnReq.orderId).lean().exec();

    return {
      ...returnReq,
      order: order || null,
    };
  }

  async reviewReturn(id: string, staffName: string, dto: ReviewReturnDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID format');
    }

    const returnReq = await this.returnModel.findById(id);
    if (!returnReq) {
      throw new NotFoundException(`Return request with ID "${id}" not found`);
    }

    if (returnReq.status === ReturnStatus.REFUNDED) {
      throw new BadRequestException('Cannot modify a return request that has already been refunded');
    }

    if (dto.decision === 'APPROVE') {
      returnReq.status = ReturnStatus.APPROVED;
      returnReq.reviewedBy = staffName;
      returnReq.reviewedAt = new Date();
      returnReq.restockOnApproval = dto.restockItems !== false;

      // ─── Automated Inventory Replenishment ───────────────────────────────
      if (dto.restockItems !== false) {
        for (const item of returnReq.items) {
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
        this.logger.log(`Replenished stock for items in return ${returnReq.returnNumber}`);
      }

      returnReq.statusHistory.push({
        status: ReturnStatus.APPROVED,
        timestamp: new Date(),
        note: dto.note || `Approved by ${staffName}${dto.restockItems !== false ? ' (Stock replenished)' : ''}`,
        changedBy: staffName,
      });
    } else {
      returnReq.status = ReturnStatus.REJECTED;
      returnReq.reviewedBy = staffName;
      returnReq.reviewedAt = new Date();
      returnReq.rejectionReason = dto.note || 'Rejected by administrator';

      returnReq.statusHistory.push({
        status: ReturnStatus.REJECTED,
        timestamp: new Date(),
        note: dto.note || `Rejected by ${staffName}`,
        changedBy: staffName,
      });
    }

    if (dto.adminNotes) {
      returnReq.adminNotes = dto.adminNotes;
    }

    await returnReq.save();
    return returnReq;
  }

  async processRefund(id: string, staffName: string, dto: ProcessRefundDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID format');
    }

    const returnReq = await this.returnModel.findById(id);
    if (!returnReq) {
      throw new NotFoundException(`Return request with ID "${id}" not found`);
    }

    if (returnReq.status === ReturnStatus.REFUNDED) {
      throw new BadRequestException('Refund has already been processed for this return request');
    }

    if (returnReq.status === ReturnStatus.REJECTED) {
      throw new BadRequestException('Cannot refund a rejected return request');
    }

    const refundAmount = dto.amount !== undefined ? dto.amount : returnReq.totalRefundAmount;
    const transactionId = dto.transactionId || `REF-${Date.now()}`;

    returnReq.status = ReturnStatus.REFUNDED;
    returnReq.refundProcessedAt = new Date();
    returnReq.refundTransactionId = transactionId;

    returnReq.statusHistory.push({
      status: ReturnStatus.REFUNDED,
      timestamp: new Date(),
      note: dto.note || `Processed refund of $${refundAmount}. Transaction ID: ${transactionId}`,
      changedBy: staffName,
    });

    await returnReq.save();

    // ─── Update Order Payment Status ──────────────────────────────────────────
    const order = await this.orderModel.findById(returnReq.orderId);
    if (order) {
      order.paymentStatus = PaymentStatus.REFUNDED;
      order.statusHistory.push({
        status: order.orderStatus,
        timestamp: new Date(),
        note: `Payment marked as REFUNDED following return ${returnReq.returnNumber} ($${refundAmount})`,
      });
      await order.save();
    }

    this.logger.log(
      `Staff "${staffName}" processed refund of $${refundAmount} for Return ${returnReq.returnNumber} (Txn: ${transactionId})`,
    );

    return returnReq;
  }
}
