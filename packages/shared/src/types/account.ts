import type { AuthUser } from './auth';

export interface CustomerAddress {
  _id: string;
  id?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AddressPayload {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface CustomerProfileResponse {
  user: AuthUser & {
    addresses?: CustomerAddress[];
  };
}

export interface AddressesResponse {
  addresses: CustomerAddress[];
  message?: string;
}

export interface SingleAddressResponse {
  address: CustomerAddress;
  addresses: CustomerAddress[];
  message: string;
}
