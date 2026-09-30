import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter, Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Address } from './schemas/address.schema';

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
    const user = await this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /** Conditional update; returns null when no document matched the filter. */
  async updateWhere(filter: QueryFilter<User>, update: UpdateQuery<User>): Promise<UserDocument | null> {
    return this.userModel.findOneAndUpdate(filter, update, { new: true }).exec();
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
