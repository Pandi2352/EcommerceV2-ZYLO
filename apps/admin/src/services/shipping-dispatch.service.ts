import { api, unwrap } from '@shared/api/client';

export type ShippingCarrier = 'FEDEX' | 'UPS' | 'DHL' | 'USPS';

export type ServiceLevel =
  | 'STANDARD_GROUND'
  | 'EXPRESS_2DAY'
  | 'OVERNIGHT_PRIORITY'
  | 'INTERNATIONAL_EXPEDITED';

export type ShipmentStatus =
  | 'MANIFEST_CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION';

export interface TrackingMilestone {
  timestamp: string;
  status: string;
  location: string;
  message: string;
}

export interface ShipmentDispatch {
  _id: string;
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  originWarehouseId: string;
  originWarehouseName: string;
  carrier: ShippingCarrier;
  serviceLevel: ServiceLevel;
  packageWeightKg: number;
  packageDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  shippingCost: number;
  trackingNumber: string;
  status: ShipmentStatus;
  trackingHistory: TrackingMilestone[];
  routingCode: string;
  thermalLabelBarcode: string;
  dispatchedAt: string;
  deliveredAt?: string;
  notes?: string;
}

export interface CarrierRateOption {
  carrier: ShippingCarrier;
  carrierName: string;
  serviceLevel: ServiceLevel;
  serviceName: string;
  rate: number;
  estimatedDays: number;
  guaranteed: boolean;
}

export interface ReadyToShipOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderStatus: string;
  grandTotal: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    lineTotal: number;
  }>;
  createdAt: string;
}

export interface CarrierWebhookLog {
  _id: string;
  carrier: string;
  trackingNumber: string;
  event: string;
  location: string;
  rawPayload: Record<string, any>;
  receivedAt: string;
}

export interface ShippingMetrics {
  totalDispatches: number;
  readyToShipCount: number;
  inTransitCount: number;
  outForDeliveryCount: number;
  deliveredCount: number;
  totalShippingSpend: number;
  avgCost: number;
  carrierBreakdown: Record<string, number>;
}

export const shippingDispatchService = {
  async getMetrics(): Promise<ShippingMetrics> {
    return unwrap(api.get('/admin/shipping-dispatch/metrics'));
  },

  async getReadyToShipOrders(): Promise<ReadyToShipOrder[]> {
    return unwrap(api.get('/admin/shipping-dispatch/ready-to-ship'));
  },

  async calculateRates(data: { weightKg: number }): Promise<CarrierRateOption[]> {
    return unwrap(api.post('/admin/shipping-dispatch/rates', data));
  },

  async createDispatch(data: {
    orderId: string;
    originWarehouseId: string;
    carrier: ShippingCarrier;
    serviceLevel: ServiceLevel;
    packageWeightKg: number;
    packageDimensions?: { length: number; width: number; height: number; unit: string };
    notes?: string;
  }): Promise<ShipmentDispatch> {
    return unwrap(api.post('/admin/shipping-dispatch', data));
  },

  async getManifests(params?: { carrier?: string; status?: string }): Promise<ShipmentDispatch[]> {
    return unwrap(api.get('/admin/shipping-dispatch/manifests', { params }));
  },

  async getManifestById(id: string): Promise<ShipmentDispatch> {
    return unwrap(api.get(`/admin/shipping-dispatch/manifests/${id}`));
  },

  async getTracking(trackingNumber: string): Promise<ShipmentDispatch> {
    return unwrap(api.get(`/admin/shipping-dispatch/tracking/${trackingNumber}`));
  },

  async simulateWebhook(data: {
    trackingNumber: string;
    status: string;
    location?: string;
    message?: string;
  }): Promise<{ success: boolean; shipment: ShipmentDispatch }> {
    return unwrap(api.post('/admin/shipping-dispatch/simulate-webhook', data));
  },

  async getWebhooks(): Promise<CarrierWebhookLog[]> {
    return unwrap(api.get('/admin/shipping-dispatch/webhooks'));
  },
};
