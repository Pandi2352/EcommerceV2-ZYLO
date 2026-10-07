import { api, unwrap } from './client';
import type { DashboardSummaryResponse } from '../types/analytics';

export const analyticsService = {
  getDashboardSummary: (range: string = '30d') =>
    unwrap<DashboardSummaryResponse>(
      api.get('/admin/analytics/dashboard', { params: { range } }),
    ),
};
