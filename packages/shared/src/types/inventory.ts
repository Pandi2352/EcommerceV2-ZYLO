export interface AdminInventoryVariant {
  sku: string;
  title: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface AdminInventoryItem {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  thumbnailUrl?: string | null;
  category?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  basePrice: number;
  salePrice?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  inventoryValuation: number;
  variants: AdminInventoryVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface InventorySummaryMetrics {
  totalProducts: number;
  totalStockUnits: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValuation: number;
}

export interface AdminInventoryQuery {
  search?: string;
  status?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  categoryId?: string;
  brandId?: string;
  sortBy?: 'stock_asc' | 'stock_desc' | 'name' | 'recent' | 'price_desc';
  page?: number;
  limit?: number;
}

export interface AdminInventoryResponse {
  items: AdminInventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdjustStockPayload {
  type: 'SET' | 'INCREMENT' | 'DECREMENT';
  quantity: number;
  variantSku?: string;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  reason?: string;
}

export interface AdjustStockResponse {
  message: string;
  productId: string;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  variants: AdminInventoryVariant[];
}
