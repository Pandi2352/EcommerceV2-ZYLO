import { api, unwrap } from '@shared/api/client';

export type WarehouseType =
  | 'PRIMARY_DISTRIBUTION'
  | 'REGIONAL_HUB'
  | 'LOCAL_STORE'
  | 'RETURN_CENTER';

export type WarehouseStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export type TransferStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'IN_TRANSIT'
  | 'PARTIALLY_RECEIVED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface WarehouseAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Warehouse {
  _id: string;
  code: string;
  name: string;
  type: WarehouseType;
  status: WarehouseStatus;
  isDefault: boolean;
  address: WarehouseAddress;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  capacitySqFt: number;
  operatingHours: string;
  servicedRegions: string[];
  totalInventoryUnits: number;
  activeTransfersCount: number;
  created_at?: string;
  updated_at?: string;
}

export interface TransferItem {
  sku: string;
  productName: string;
  variantTitle?: string;
  requestedQty: number;
  shippedQty: number;
  receivedQty: number;
}

export interface StockTransfer {
  _id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  status: TransferStatus;
  items: TransferItem[];
  totalItemsCount: number;
  totalQuantity: number;
  carrier?: string;
  trackingNumber?: string;
  estimatedArrival?: string | null;
  shippedAt?: string | null;
  receivedAt?: string | null;
  notes?: string;
  createdBy: string;
  receivedBy?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseInventoryItem {
  _id: string;
  warehouseId: string;
  sku: string;
  productName: string;
  variantTitle?: string;
  quantity: number;
  reservedQuantity: number;
  safetyStock: number;
  binLocation: string;
}

export interface WarehouseMetrics {
  totalWarehouses: number;
  activeWarehouses: number;
  inTransitTransfers: number;
  totalUnitsStocked: number;
  totalSkusTracked: number;
}

export interface CreateWarehousePayload {
  code: string;
  name: string;
  type?: WarehouseType;
  status?: WarehouseStatus;
  isDefault?: boolean;
  address: WarehouseAddress;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  capacitySqFt?: number;
  operatingHours?: string;
  servicedRegions?: string[];
}

export interface CreateStockTransferPayload {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  items: Array<{
    sku: string;
    productName: string;
    variantTitle?: string;
    requestedQty: number;
  }>;
  carrier?: string;
  trackingNumber?: string;
  estimatedArrival?: string;
  notes?: string;
}

export interface ReceiveStockTransferPayload {
  receivedItems: Array<{
    sku: string;
    receivedQty: number;
  }>;
  notes?: string;
  receivedBy?: string;
}

export const warehousesService = {
  async getMetrics(): Promise<WarehouseMetrics> {
    return unwrap<WarehouseMetrics>(api.get('/admin/warehouses/metrics'));
  },

  async getWarehouses(params?: { search?: string; type?: WarehouseType; status?: WarehouseStatus }): Promise<Warehouse[]> {
    return unwrap<Warehouse[]>(api.get('/admin/warehouses', { params }));
  },

  async getWarehouseById(id: string): Promise<Warehouse> {
    return unwrap<Warehouse>(api.get(`/admin/warehouses/${id}`));
  },

  async createWarehouse(payload: CreateWarehousePayload): Promise<Warehouse> {
    return unwrap<Warehouse>(api.post('/admin/warehouses', payload));
  },

  async updateWarehouse(id: string, payload: Partial<CreateWarehousePayload>): Promise<Warehouse> {
    return unwrap<Warehouse>(api.put(`/admin/warehouses/${id}`, payload));
  },

  async toggleStatus(id: string, status: WarehouseStatus): Promise<Warehouse> {
    return unwrap<Warehouse>(api.patch(`/admin/warehouses/${id}/status`, { status }));
  },

  async deleteWarehouse(id: string): Promise<{ message: string }> {
    return unwrap<{ message: string }>(api.delete(`/admin/warehouses/${id}`));
  },

  async getWarehouseInventory(warehouseId: string): Promise<WarehouseInventoryItem[]> {
    return unwrap<WarehouseInventoryItem[]>(api.get(`/admin/warehouses/${warehouseId}/inventory`));
  },

  async getStockTransfers(params?: { search?: string; status?: TransferStatus; warehouseId?: string }): Promise<StockTransfer[]> {
    return unwrap<StockTransfer[]>(api.get('/admin/stock-transfers', { params }));
  },

  async getStockTransferById(id: string): Promise<StockTransfer> {
    return unwrap<StockTransfer>(api.get(`/admin/stock-transfers/${id}`));
  },

  async createStockTransfer(payload: CreateStockTransferPayload): Promise<StockTransfer> {
    return unwrap<StockTransfer>(api.post('/admin/stock-transfers', payload));
  },

  async updateTransferStatus(id: string, status: TransferStatus): Promise<StockTransfer> {
    return unwrap<StockTransfer>(api.patch(`/admin/stock-transfers/${id}/status`, { status }));
  },

  async receiveStockTransfer(id: string, payload: ReceiveStockTransferPayload): Promise<StockTransfer> {
    return unwrap<StockTransfer>(api.post(`/admin/stock-transfers/${id}/receive`, payload));
  },
};
