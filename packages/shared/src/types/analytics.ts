export interface DashboardKpiItem {
  value: number;
  changePercentage: number | null; // e.g. +14.2 or -5.1
  isPositive: boolean | null;
  periodValue: number;
  previousValue: number;
}

export interface DashboardProductsKpi {
  value: number;
  totalCatalog: number;
  draftCount: number;
  archivedCount: number;
}

export interface DashboardAovKpi {
  value: number;
  totalAov: number;
}

export interface LowStockProductItem {
  _id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  basePrice: number;
  thumbnailUrl?: string | null;
}

export interface DashboardAlerts {
  pendingFulfillmentCount: number;
  pendingOrdersCount: number;
  processingOrdersCount: number;
  outOfStockCount: number;
  lowStockCount: number;
  lowStockProducts: LowStockProductItem[];
  pendingRefundsCount?: number;
}

export interface SalesTimelinePoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface DashboardRecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  itemsCount: number;
  createdAt: string;
}

export interface DashboardRecentCustomer {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  totalOrders: number;
  lifetimeSpend: number;
}

export interface DashboardTopCategory {
  _id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface DashboardSummaryResponse {
  range: string;
  kpis: {
    revenue: DashboardKpiItem;
    orders: DashboardKpiItem;
    customers: DashboardKpiItem;
    products: DashboardProductsKpi;
    aov: DashboardAovKpi;
  };
  alerts: DashboardAlerts;
  chartData: SalesTimelinePoint[];
  recentOrders: DashboardRecentOrder[];
  recentCustomers: DashboardRecentCustomer[];
  topCategories: DashboardTopCategory[];
}
