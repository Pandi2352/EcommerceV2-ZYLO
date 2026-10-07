import type { CustomerAddress } from './account';
import type { Order } from './order';

export interface AdminCustomerItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  addresses?: CustomerAddress[];
  role: string;
  accountType?: string;
  isActive: boolean;
  status: string;
  totalOrders: number;
  lifetimeSpend: number;
  lastOrderDate?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  suspendedCustomers: number;
  customersWithOrders: number;
  totalCustomerSpend: number;
}

export interface AdminCustomerQuery {
  search?: string;
  status?: string;
  sortBy?: 'recent' | 'spend' | 'orders' | 'name';
  page?: number;
  limit?: number;
}

export interface AdminCustomersResponse {
  items: AdminCustomerItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCustomerDetails {
  customer: AdminCustomerItem;
  orders: Order[];
  stats: {
    totalOrders: number;
    lifetimeSpend: number;
    averageOrderValue: number;
  };
}
