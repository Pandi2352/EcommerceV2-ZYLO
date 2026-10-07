import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter, Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Address } from './schemas/address.schema';
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
}
