import { api, unwrap } from './client';
import type {
  AddressesResponse,
  AddressPayload,
  CustomerProfileResponse,
  SingleAddressResponse,
  UpdateProfilePayload,
} from '../types/account';

export const accountService = {
  getProfile: () =>
    unwrap<CustomerProfileResponse>(api.get('/account/profile')),

  updateProfile: (payload: UpdateProfilePayload) =>
    unwrap<CustomerProfileResponse & { message: string }>(api.patch('/account/profile', payload)),

  getAddresses: () =>
    unwrap<AddressesResponse>(api.get('/account/addresses')),

  addAddress: (payload: AddressPayload) =>
    unwrap<SingleAddressResponse>(api.post('/account/addresses', payload)),

  updateAddress: (id: string, payload: AddressPayload) =>
    unwrap<SingleAddressResponse>(api.put(`/account/addresses/${id}`, payload)),

  deleteAddress: (id: string) =>
    unwrap<AddressesResponse>(api.delete(`/account/addresses/${id}`)),

  setDefaultAddress: (id: string) =>
    unwrap<AddressesResponse>(api.patch(`/account/addresses/${id}/default`)),
};
