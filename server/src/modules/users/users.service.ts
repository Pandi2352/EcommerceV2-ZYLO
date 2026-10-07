import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter, Model, UpdateQuery } from 'mongoose';
import { User, UserDocument, UserStatus } from './schemas/user.schema';
import { Address } from './schemas/address.schema';
import { UserRole } from '../../common/enums/user-role.enum';
import { AccountType } from '../../common/enums/account-type.enum';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { AdminCustomerQueryDto } from './dto/admin-customer-query.dto';
import { v4 as uuidv4 } from 'uuid';

/** Hidden (select: false) fields callers can opt into, e.g. '+passwordHash'. */
export type UserSecretField =
  | 'passwordHash'
  | 'previousPasswordHash'
  | 'passwordResetTokenHash'
  | 'passwordResetExpires'
  | 'emailVerificationTokenHash'
  | 'emailVerificationExpires'
  | 'mfaSecret'
  | 'mfaPendingSecret'
  | 'mfaBackupCodeHashes'
  | 'mfaLastUsedStep';

const toSelect = (fields: UserSecretField[]) => fields.map((field) => `+${field}`).join(' ');

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async findByEmail(email: string, secrets: UserSecretField[] = []): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select(toSelect(secrets)).exec();
  }

  async findById(id: string, secrets: UserSecretField[] = []): Promise<UserDocument | null> {
    return this.userModel.findById(id).select(toSelect(secrets)).exec();
  }

  /** Internal lookups only: callers must build the filter from validated values. */
  async findOne(filter: QueryFilter<User>, secrets: UserSecretField[] = []): Promise<UserDocument | null> {
    return this.userModel.findOne(filter).select(toSelect(secrets)).exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async update(id: string, update: UpdateQuery<User>): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, update, { returnDocument: 'after' }).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /** Conditional update; returns null when no document matched the filter. */
  async updateWhere(filter: QueryFilter<User>, update: UpdateQuery<User>): Promise<UserDocument | null> {
    return this.userModel.findOneAndUpdate(filter, update, { returnDocument: 'after' }).exec();
  }

  async updateProfile(userId: string, dto: Partial<User>): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl.trim();

    // If firstName or lastName was set but name wasn't explicitly changed, sync name
    if ((dto.firstName !== undefined || dto.lastName !== undefined) && dto.name === undefined) {
      const parts = [user.firstName, user.lastName].filter(Boolean);
      if (parts.length > 0) {
        user.name = parts.join(' ');
      }
    }

    return user.save();
  }

  async getAddresses(userId: string): Promise<Address[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user.addresses || [];
  }

  async addAddress(userId: string, addressDto: Partial<Address>): Promise<{ address: Address; addresses: Address[] }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    const isFirst = user.addresses.length === 0;
    const isDefault = isFirst || Boolean(addressDto.isDefault);

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      _id: (addressDto as any)._id || (addressDto as any).id || uuidv4(),
      street: addressDto.street?.trim() || '',
      city: addressDto.city?.trim() || '',
      state: addressDto.state?.trim() || '',
      postalCode: addressDto.postalCode?.trim() || '',
      country: addressDto.country?.trim() || 'US',
      phone: addressDto.phone?.trim() || '',
      isDefault,
    } as Address;

    user.addresses.push(newAddress);
    await user.save();

    return { address: newAddress, addresses: user.addresses };
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: Partial<Address>,
  ): Promise<{ address: Address; addresses: Address[] }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const index = user.addresses.findIndex((a) => (a as any)._id === addressId || (a as any).id === addressId);
    if (index === -1) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    if (dto.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const current = user.addresses[index];
    const updated: Address = {
      _id: (current as any)._id,
      street: dto.street !== undefined ? dto.street.trim() : current.street,
      city: dto.city !== undefined ? dto.city.trim() : current.city,
      state: dto.state !== undefined ? dto.state.trim() : current.state,
      postalCode: dto.postalCode !== undefined ? dto.postalCode.trim() : current.postalCode,
      country: dto.country !== undefined ? dto.country.trim() : current.country,
      phone: dto.phone !== undefined ? dto.phone.trim() : current.phone,
      isDefault: dto.isDefault !== undefined ? dto.isDefault : current.isDefault,
    } as Address;

    user.addresses[index] = updated;
    await user.save();

    return { address: updated, addresses: user.addresses };
  }

  async deleteAddress(userId: string, addressId: string): Promise<{ addresses: Address[] }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const index = user.addresses.findIndex((a) => (a as any)._id === addressId || (a as any).id === addressId);
    if (index === -1) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    const wasDefault = user.addresses[index].isDefault;
    user.addresses.splice(index, 1);

    // If removed address was default and there are remaining addresses, set the first one as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return { addresses: user.addresses };
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<{ addresses: Address[] }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const target = user.addresses.find((a) => (a as any)._id === addressId || (a as any).id === addressId);
    if (!target) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = (addr as any)._id === addressId || (addr as any).id === addressId;
    });

    await user.save();
    return { addresses: user.addresses };
  }

  // ─── Admin Customer Oversight ───────────────────────────────────────────────

  /**
   * Search and list customers with lifetime spend and order metrics
   */
  async findCustomersAdmin(query: AdminCustomerQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {
      $or: [
        { role: UserRole.CUSTOMER },
        { accountType: AccountType.CUSTOMER },
      ],
    };

    if (query.search && query.search.trim()) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { name: regex },
            { email: regex },
            { phone: regex },
          ],
        },
      ];
    }

    if (query.status && query.status !== 'ALL') {
      if (query.status === 'ACTIVE') {
        filter.isActive = true;
      } else if (query.status === 'SUSPENDED') {
        filter.$or = [{ isActive: false }, { status: UserStatus.INACTIVE }];
      }
    }

    const [customers, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    // Aggregate orders for these customers to get lifetime spend and order counts
    const customerIds = customers.map((c) => c._id.toString());
    const orderStats = await this.orderModel.aggregate([
      { $match: { userId: { $in: customerIds } } },
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          lifetimeSpend: { $sum: '$grandTotal' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const statsMap = new Map<string, any>(
      orderStats.map((s) => [s._id.toString(), s]),
    );

    let items = customers.map((c) => {
      const s = statsMap.get(c._id.toString());
      return {
        ...c,
        totalOrders: s?.totalOrders || 0,
        lifetimeSpend: s ? Math.round(s.lifetimeSpend * 100) / 100 : 0,
        lastOrderDate: s?.lastOrderDate || null,
      };
    });

    if (query.sortBy === 'spend') {
      items.sort((a, b) => b.lifetimeSpend - a.lifetimeSpend);
    } else if (query.sortBy === 'orders') {
      items.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (query.sortBy === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin: Get summary statistics for customer directory
   */
  async getCustomerStatsAdmin() {
    const customerFilter = {
      $or: [
        { role: UserRole.CUSTOMER },
        { accountType: AccountType.CUSTOMER },
      ],
    };

    const [total, active, suspended, orderAgg] = await Promise.all([
      this.userModel.countDocuments(customerFilter),
      this.userModel.countDocuments({ ...customerFilter, isActive: true }),
      this.userModel.countDocuments({ ...customerFilter, isActive: false }),
      this.orderModel.aggregate([
        {
          $group: {
            _id: '$userId',
            spend: { $sum: '$grandTotal' },
            orders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalCustomerSpend = orderAgg.reduce((sum, item) => sum + (item.spend || 0), 0);
    const customersWithOrders = orderAgg.length;

    return {
      totalCustomers: total,
      activeCustomers: active,
      suspendedCustomers: suspended,
      customersWithOrders,
      totalCustomerSpend: Math.round(totalCustomerSpend * 100) / 100,
    };
  }

  /**
   * Admin: Get full customer details with recent order history
   */
  async getCustomerDetailsAdmin(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) {
      throw new NotFoundException(`Customer #${id} not found`);
    }

    const orders = await this.orderModel
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const lifetimeSpend = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue =
      totalOrders > 0 ? Math.round((lifetimeSpend / totalOrders) * 100) / 100 : 0;

    return {
      customer: {
        ...user,
        totalOrders,
        lifetimeSpend: Math.round(lifetimeSpend * 100) / 100,
      },
      orders,
      stats: {
        totalOrders,
        lifetimeSpend: Math.round(lifetimeSpend * 100) / 100,
        averageOrderValue,
      },
    };
  }

  /**
   * Admin: Toggle customer account active or suspended status
   */
  async toggleCustomerStatusAdmin(id: string, explicitStatus?: boolean) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`Customer #${id} not found`);
    }

    const newActive = explicitStatus !== undefined ? explicitStatus : !user.isActive;
    user.isActive = newActive;
    user.status = newActive ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    await user.save();

    return {
      customer: user,
      message: `Customer account is now ${newActive ? 'Active' : 'Suspended'}`,
    };
  }

  /**
   * Admin: Export customers directory to CSV or JSON
   */
  async exportCustomersAdmin(format: 'csv' | 'json' = 'csv') {
    const res = await this.findCustomersAdmin({ limit: 1000 });
    const items = res.items;

    if (format === 'json') {
      return {
        data: JSON.stringify(items, null, 2),
        filename: `customers-export-${Date.now()}.json`,
        contentType: 'application/json',
      };
    }

    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Status',
      'Total Orders',
      'Lifetime Spend',
      'Addresses Count',
      'Joined Date',
      'Last Login',
    ];

    const rows = items.map((c: any) => [
      c._id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.email || '',
      c.phone || '',
      c.isActive ? 'ACTIVE' : 'SUSPENDED',
      c.totalOrders || 0,
      c.lifetimeSpend || 0,
      c.addresses?.length || 0,
      c.createdAt ? new Date(c.createdAt).toISOString() : '',
      c.lastLoginAt ? new Date(c.lastLoginAt).toISOString() : '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return {
      data: csvContent,
      filename: `customers-export-${Date.now()}.csv`,
      contentType: 'text/csv',
    };
  }
}
