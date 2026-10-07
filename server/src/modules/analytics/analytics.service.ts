import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { UserRole } from '../../common/enums/user-role.enum';
import { AccountType } from '../../common/enums/account-type.enum';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

export interface DashboardKpiItem {
  value: number;
  changePercentage: number | null; // e.g. +14.2 or -5.1
  isPositive: boolean | null;
  periodValue: number;
  previousValue: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async getDashboardSummary(dto: DashboardQueryDto) {
    const range = dto.range || '30d';
    const { startDate, prevStartDate, daysCount } = this.calculateDateRanges(range);

    // Run parallel analytical queries for optimal performance
    const [
      revenueStats,
      orderStats,
      customerStats,
      productStats,
      alerts,
      chartData,
      recentOrders,
      recentCustomers,
      topCategories,
    ] = await Promise.all([
      this.getRevenueKpi(startDate, prevStartDate),
      this.getOrdersKpi(startDate, prevStartDate),
      this.getCustomersKpi(startDate, prevStartDate),
      this.getProductsKpi(),
      this.getOperationalAlerts(),
      this.getSalesTimelineChart(startDate, daysCount),
      this.getRecentOrders(),
      this.getRecentCustomers(),
      this.getTopCategories(),
    ]);

    return {
      range,
      kpis: {
        revenue: revenueStats,
        orders: orderStats,
        customers: customerStats,
        products: productStats,
        aov: {
          value:
            orderStats.periodValue > 0
              ? Math.round((revenueStats.periodValue / orderStats.periodValue) * 100) / 100
              : 0,
          totalAov:
            orderStats.value > 0
              ? Math.round((revenueStats.value / orderStats.value) * 100) / 100
              : 0,
        },
      },
      alerts,
      chartData,
      recentOrders,
      recentCustomers,
      topCategories,
    };
  }

  private calculateDateRanges(range: string) {
    const now = new Date();
    let daysCount = 30;

    if (range === '7d') daysCount = 7;
    else if (range === '14d') daysCount = 14;
    else if (range === '30d') daysCount = 30;
    else if (range === '90d') daysCount = 90;
    else if (range === 'year') daysCount = 365;
    else if (range === 'all') daysCount = 730;

    const startDate = new Date(now.getTime() - daysCount * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(startDate.getTime() - daysCount * 24 * 60 * 60 * 1000);

    return { startDate, prevStartDate, daysCount };
  }

  private calculateGrowth(current: number, previous: number) {
    if (previous === 0) {
      if (current === 0) return { changePercentage: 0, isPositive: null };
      return { changePercentage: 100, isPositive: true };
    }
    const diff = current - previous;
    const change = Math.round((diff / previous) * 1000) / 10;
    return {
      changePercentage: change,
      isPositive: change > 0 ? true : change < 0 ? false : null,
    };
  }

  private async getRevenueKpi(startDate: Date, prevStartDate: Date): Promise<DashboardKpiItem> {
    const nonCancelled = { orderStatus: { $ne: OrderStatus.CANCELLED } };

    // Total lifetime revenue
    const totalAgg = await this.orderModel.aggregate([
      { $match: nonCancelled },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const totalLifetime = totalAgg[0]?.total || 0;

    // Current period revenue
    const currentAgg = await this.orderModel.aggregate([
      { $match: { ...nonCancelled, createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const currentPeriod = currentAgg[0]?.total || 0;

    // Previous period revenue
    const prevAgg = await this.orderModel.aggregate([
      { $match: { ...nonCancelled, createdAt: { $gte: prevStartDate, $lt: startDate } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const prevPeriod = prevAgg[0]?.total || 0;

    const growth = this.calculateGrowth(currentPeriod, prevPeriod);

    return {
      value: Math.round(totalLifetime * 100) / 100,
      periodValue: Math.round(currentPeriod * 100) / 100,
      previousValue: Math.round(prevPeriod * 100) / 100,
      changePercentage: growth.changePercentage,
      isPositive: growth.isPositive,
    };
  }

  private async getOrdersKpi(startDate: Date, prevStartDate: Date): Promise<DashboardKpiItem> {
    const nonCancelled = { orderStatus: { $ne: OrderStatus.CANCELLED } };

    const [totalOrders, currentOrders, prevOrders] = await Promise.all([
      this.orderModel.countDocuments(nonCancelled).exec(),
      this.orderModel.countDocuments({ ...nonCancelled, createdAt: { $gte: startDate } }).exec(),
      this.orderModel
        .countDocuments({ ...nonCancelled, createdAt: { $gte: prevStartDate, $lt: startDate } })
        .exec(),
    ]);

    const growth = this.calculateGrowth(currentOrders, prevOrders);

    return {
      value: totalOrders,
      periodValue: currentOrders,
      previousValue: prevOrders,
      changePercentage: growth.changePercentage,
      isPositive: growth.isPositive,
    };
  }

  private async getCustomersKpi(startDate: Date, prevStartDate: Date): Promise<DashboardKpiItem> {
    const customerFilter: any = {
      $or: [
        { role: UserRole.CUSTOMER },
        { accountType: AccountType.CUSTOMER },
      ],
    };

    const [totalCust, currentCust, prevCust] = await Promise.all([
      this.userModel.countDocuments(customerFilter).exec(),
      this.userModel.countDocuments({ ...customerFilter, createdAt: { $gte: startDate } } as any).exec(),
      this.userModel
        .countDocuments({ ...customerFilter, createdAt: { $gte: prevStartDate, $lt: startDate } } as any)
        .exec(),
    ]);

    const growth = this.calculateGrowth(currentCust, prevCust);

    return {
      value: totalCust,
      periodValue: currentCust,
      previousValue: prevCust,
      changePercentage: growth.changePercentage,
      isPositive: growth.isPositive,
    };
  }

  private async getProductsKpi() {
    const [totalPublished, totalDraft, totalArchived] = await Promise.all([
      this.productModel.countDocuments({ status: 'PUBLISHED' }).exec(),
      this.productModel.countDocuments({ status: 'DRAFT' }).exec(),
      this.productModel.countDocuments({ status: 'ARCHIVED' }).exec(),
    ]);

    return {
      value: totalPublished,
      totalCatalog: totalPublished + totalDraft + totalArchived,
      draftCount: totalDraft,
      archivedCount: totalArchived,
    };
  }

  private async getOperationalAlerts() {
    const [pendingOrders, processingOrders, outOfStockProducts, lowStockProductsList, refundedOrdersCount] =
      await Promise.all([
        this.orderModel.countDocuments({ orderStatus: OrderStatus.PENDING }).exec(),
        this.orderModel.countDocuments({ orderStatus: OrderStatus.PROCESSING }).exec(),
        this.productModel.countDocuments({ stockQuantity: { $lte: 0 }, status: 'PUBLISHED' }).exec(),
        this.productModel
          .find({
            stockQuantity: { $gt: 0, $lte: 5 },
            status: 'PUBLISHED',
          })
          .select('_id name sku stockQuantity lowStockThreshold basePrice thumbnailUrl')
          .sort({ stockQuantity: 1 })
          .limit(10)
          .lean()
          .exec(),
        this.orderModel.countDocuments({ paymentStatus: PaymentStatus.REFUNDED }).exec(),
      ]);

    return {
      pendingFulfillmentCount: pendingOrders + processingOrders,
      pendingOrdersCount: pendingOrders,
      processingOrdersCount: processingOrders,
      outOfStockCount: outOfStockProducts,
      lowStockCount: lowStockProductsList.length,
      lowStockProducts: lowStockProductsList,
      pendingRefundsCount: refundedOrdersCount,
    };
  }

  private async getSalesTimelineChart(startDate: Date, daysCount: number) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 as const },
      },
    ];

    const rawStats = await this.orderModel.aggregate(pipeline);
    const statsMap = new Map<string, { revenue: number; orders: number }>();
    for (const item of rawStats) {
      statsMap.set(item._id, {
        revenue: Math.round(item.revenue * 100) / 100,
        orders: item.orders,
      });
    }

    // Build complete consecutive daily timeline so graph has no gaps
    const timeline: { date: string; label: string; revenue: number; orders: number }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().slice(0, 10);
      const stat = statsMap.get(dateKey) || { revenue: 0, orders: 0 };

      timeline.push({
        date: dateKey,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: stat.revenue,
        orders: stat.orders,
      });
    }

    return timeline;
  }

  private async getRecentOrders() {
    const orders = await this.orderModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id orderNumber customerName customerEmail grandTotal orderStatus paymentStatus paymentMethod items createdAt')
      .lean()
      .exec();

    return orders.map((o: any) => ({
      _id: o._id.toString(),
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      grandTotal: o.grandTotal,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      itemsCount: o.items?.length || 0,
      createdAt: o.createdAt,
    }));
  }

  private async getRecentCustomers() {
    const customerFilter: any = {
      $or: [
        { role: UserRole.CUSTOMER },
        { accountType: AccountType.CUSTOMER },
      ],
    };

    const customers = await this.userModel
      .find(customerFilter)
      .sort({ createdAt: -1 })
      .limit(6)
      .select('_id name email avatarUrl isActive status createdAt')
      .lean()
      .exec();

    if (customers.length === 0) return [];

    const customerIds = customers.map((c) => c._id.toString());
    const customerOrders = await this.orderModel.aggregate([
      {
        $match: {
          userId: { $in: customerIds },
          orderStatus: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          lifetimeSpend: { $sum: '$grandTotal' },
        },
      },
    ]);

    const orderStatsMap = new Map<string, { totalOrders: number; lifetimeSpend: number }>();
    for (const stat of customerOrders) {
      orderStatsMap.set(stat._id, {
        totalOrders: stat.totalOrders,
        lifetimeSpend: Math.round(stat.lifetimeSpend * 100) / 100,
      });
    }

    return customers.map((c) => {
      const stats = orderStatsMap.get(c._id.toString()) || { totalOrders: 0, lifetimeSpend: 0 };
      return {
        _id: c._id.toString(),
        name: c.name,
        email: c.email,
        avatarUrl: c.avatarUrl,
        isActive: c.isActive !== false && c.status !== 'INACTIVE',
        createdAt: c.createdAt,
        totalOrders: stats.totalOrders,
        lifetimeSpend: stats.lifetimeSpend,
      };
    });
  }

  private async getTopCategories() {
    const categories = await this.categoryModel
      .find({ parentId: null })
      .select('_id name slug')
      .limit(8)
      .lean()
      .exec();

    if (categories.length === 0) return [];

    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await this.productModel.countDocuments({
          categoryId: cat._id,
          status: 'PUBLISHED',
        });
        return {
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          productCount,
        };
      }),
    );

    return categoryStats.sort((a, b) => b.productCount - a.productCount);
  }
}
