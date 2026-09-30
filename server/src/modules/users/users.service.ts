import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Address } from './schemas/address.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Automatically ensure a default test admin exists when server boots
   */
  async onModuleInit(): Promise<void> {
    await this.seedDefaultUsers();
  }

  private async seedDefaultUsers(): Promise<void> {
    const adminEmail = 'admin@zylo.internal';
    const adminExisting = await this.findByEmail(adminEmail);

    if (!adminExisting) {
      const defaultPassword = 'AdminPassword123!';
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

      await this.create({
        name: 'System Administrator',
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
        isEmailVerified: true,
      });

      this.logger.log(`🛡️ Seeded default Admin user: ${adminEmail} (password: ${defaultPassword})`);
    }

    const customerEmail = 'customer@zylo.internal';
    const customerExisting = await this.findByEmail(customerEmail);

    if (!customerExisting) {
      const defaultCustPassword = 'CustomerPassword123!';
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(defaultCustPassword, salt);

      await this.create({
        name: 'Test Customer',
        email: customerEmail,
        passwordHash,
        role: UserRole.CUSTOMER,
        isActive: true,
        isEmailVerified: true,
      });

      this.logger.log(`👤 Seeded default Customer user: ${customerEmail} (password: ${defaultCustPassword})`);
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async update(id: string, updateData: Partial<User>): Promise<UserDocument | null> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async addAddress(userId: string, address: Address): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (address.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(address);
    return user.save();
  }
}
