import { api, unwrap } from '@shared/api/client';

export type PaymentTerms =
  | 'NET_15'
  | 'NET_30'
  | 'NET_60'
  | 'IMMEDIATE'
  | 'ADVANCE_50';

export type SupplierStatus = 'ACTIVE' | 'INACTIVE';

export interface SupplierAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Supplier {
  _id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: SupplierAddress;
  paymentTerms: PaymentTerms;
  leadTimeDays: number;
  status: SupplierStatus;
  rating: number;
  taxId?: string;
  notes?: string;
  createdAt?: string;
}

export type POStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export type POPaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface POLineItem {
  productId: string;
  sku: string;
  name: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierCode?: string;
  destinationWarehouseId: string;
  destinationWarehouseCode?: string;
  destinationWarehouseName: string;
  items: POLineItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  status: POStatus;
  paymentStatus: POPaymentStatus;
  expectedDeliveryDate?: string;
  issuedAt?: string;
  receivedAt?: string;
  createdBy: string;
  notes?: string;
  createdAt?: string;
}

export interface ReceivingItem {
  sku: string;
  name: string;
  deliveredQty: number;
  acceptedQty: number;
  rejectedQty?: number;
  rejectionReason?: string;
}

export interface ReceivingDockReceipt {
  _id: string;
  receiptNumber: string;
  poId: string;
  poNumber: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  dockBay: string;
  inspectorName: string;
  items: ReceivingItem[];
  passedInspection: boolean;
  notes?: string;
  receivedAt: string;
}

export interface POMetrics {
  totalSuppliers: number;
  activeSuppliers: number;
  totalPOs: number;
  openPOCount: number;
  pendingReceivingCount: number;
  completedCount: number;
  totalSpend: number;
}

export const purchaseOrdersService = {
  // Metrics
  async getMetrics(): Promise<POMetrics> {
    return unwrap(api.get('/admin/purchase-orders/metrics'));
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return unwrap(api.get('/admin/suppliers'));
  },

  async getSupplierById(id: string): Promise<Supplier> {
    return unwrap(api.get(`/admin/suppliers/${id}`));
  },

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    return unwrap(api.post('/admin/suppliers', data));
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    return unwrap(api.put(`/admin/suppliers/${id}`, data));
  },

  async deleteSupplier(id: string): Promise<{ success: boolean; message: string }> {
    return unwrap(api.delete(`/admin/suppliers/${id}`));
  },

  // Purchase Orders
  async getPurchaseOrders(params?: { status?: string; supplierId?: string }): Promise<PurchaseOrder[]> {
    return unwrap(api.get('/admin/purchase-orders', { params }));
  },

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    return unwrap(api.get(`/admin/purchase-orders/${id}`));
  },

  async createPurchaseOrder(data: {
    supplierId: string;
    destinationWarehouseId: string;
    items: Array<{
      productId: string;
      sku: string;
      name: string;
      orderedQty: number;
      unitCost: number;
    }>;
    shippingCost?: number;
    taxAmount?: number;
    expectedDeliveryDate?: string;
    notes?: string;
  }): Promise<PurchaseOrder> {
    return unwrap(api.post('/admin/purchase-orders', data));
  },

  async updatePOStatus(id: string, status: POStatus): Promise<PurchaseOrder> {
    return unwrap(api.patch(`/admin/purchase-orders/${id}/status`, { status }));
  },

  // Receiving Dock
  async receiveDockShipment(data: {
    poId: string;
    items: ReceivingItem[];
    dockBay?: string;
    inspectorName?: string;
    passedInspection?: boolean;
    notes?: string;
  }): Promise<{ success: boolean; receiptNumber: string; poStatus: POStatus }> {
    return unwrap(api.post('/admin/receiving-dock', data));
  },

  async getDockReceipts(): Promise<ReceivingDockReceipt[]> {
    return unwrap(api.get('/admin/receiving-dock'));
  },
};
