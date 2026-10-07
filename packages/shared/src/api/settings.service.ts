import { api, unwrap } from './client';
import type {
  BusinessSettings,
  ContactInquiryItem,
  ContactInquiryPayload,
  PublicBusinessSettings,
  UpdateBusinessSettingsPayload,
} from '../types/settings';

export const settingsService = {
  getPublicSettings: () =>
    unwrap<PublicBusinessSettings>(api.get('/settings/public')),

  submitContactMessage: (payload: ContactInquiryPayload) =>
    unwrap<{ success: boolean; inquiryId: string; message: string }>(
      api.post('/settings/contact', payload),
    ),

  getAdminSettings: () =>
    unwrap<BusinessSettings>(api.get('/admin/settings')),

  updateAdminSettings: (payload: UpdateBusinessSettingsPayload) =>
    unwrap<{ settings: BusinessSettings; message: string }>(
      api.put('/admin/settings', payload),
    ),

  getInquiriesAdmin: (page = 1, limit = 20) =>
    unwrap<{ inquiries: ContactInquiryItem[]; total: number; page: number; limit: number; totalPages: number }>(
      api.get('/admin/settings/inquiries', { params: { page, limit } }),
    ),

  updateInquiryStatusAdmin: (id: string, status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED') =>
    unwrap<{ inquiry: ContactInquiryItem; message: string }>(
      api.patch(`/admin/settings/inquiries/${id}/status`, { status }),
    ),
};
