import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  ShipmentDispatch,
  ShipmentDispatchDocument,
  ShippingCarrier,
  ServiceLevel,
  ShipmentStatus,
} from './schemas/shipment-dispatch.schema';
import {
  CarrierWebhook,
  CarrierWebhookDocument,
} from './schemas/carrier-webhook.schema';
import {
  Warehouse,
  WarehouseDocument,
} from '../warehouses/schemas/warehouse.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import {
  CreateDispatchDto,
  GetRatesDto,
  SimulateWebhookDto,
} from './dto/create-dispatch.dto';

@Injectable()
export class ShippingDispatchService {
  private readonly logger = new Logger(ShippingDispatchService.name);

  constructor(
    @InjectModel(ShipmentDispatch.name)
    private readonly dispatchModel: Model<ShipmentDispatchDocument>,
    @InjectModel(CarrierWebhook.name)
    private readonly webhookModel: Model<CarrierWebhookDocument>,
    @InjectModel(Warehouse.name)
    private readonly warehouseModel: Model<WarehouseDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  // ==========================================
  // METRICS
  // ==========================================
  async getMetrics() {
    const dispatches = await this.dispatchModel.find();
    let totalShippingSpend = 0;
    let inTransitCount = 0;
    let outForDeliveryCount = 0;
    let deliveredCount = 0;
    const carrierBreakdown: Record<string, number> = {
      FEDEX: 0,
      UPS: 0,
      DHL: 0,
      USPS: 0,
    };

    for (const d of dispatches) {
      totalShippingSpend += d.shippingCost || 0;
      if (d.status === ShipmentStatus.IN_TRANSIT) inTransitCount++;
      if (d.status === ShipmentStatus.OUT_FOR_DELIVERY) outForDeliveryCount++;
      if (d.status === ShipmentStatus.DELIVERED) deliveredCount++;
      if (carrierBreakdown[d.carrier] !== undefined) {
        carrierBreakdown[d.carrier]++;
      }
    }

    const readyToShipCount = await this.orderModel.countDocuments({
      status: { $in: ['PROCESSING', 'PAID'] },
    });

    return {
      totalDispatches: dispatches.length,
      readyToShipCount,
      inTransitCount,
      outForDeliveryCount,
      deliveredCount,
      totalShippingSpend: Number(totalShippingSpend.toFixed(2)),
      avgCost: dispatches.length > 0 ? Number((totalShippingSpend / dispatches.length).toFixed(2)) : 0,
      carrierBreakdown,
    };
  }

  // ==========================================
  // READY TO SHIP ORDERS
  // ==========================================
  async getReadyToShipOrders() {
    // Orders that are paid or processing
    const orders = await this.orderModel
      .find({ orderStatus: { $in: [OrderStatus.PROCESSING, OrderStatus.CONFIRMED, OrderStatus.PENDING] } })
      .sort({ createdAt: -1 })
      .limit(30);

    // Map and verify if already has shipment
    const existingShipmentOrderIds = new Set(
      (await this.dispatchModel.find().select('orderId')).map((s) => s.orderId),
    );

    return orders.filter((o) => !existingShipmentOrderIds.has(o._id.toString()));
  }

  // ==========================================
  // MULTI-CARRIER RATE COMPARISON
  // ==========================================
  async calculateRates(dto: GetRatesDto) {
    const w = dto.weightKg || 1.0;

    return [
      {
        carrier: ShippingCarrier.FEDEX,
        carrierName: 'FedEx Express & Ground',
        serviceLevel: ServiceLevel.STANDARD_GROUND,
        serviceName: 'FedEx Home Delivery',
        rate: Number((9.5 + w * 2.2).toFixed(2)),
        estimatedDays: 3,
        guaranteed: false,
      },
      {
        carrier: ShippingCarrier.FEDEX,
        carrierName: 'FedEx Express & Ground',
        serviceLevel: ServiceLevel.EXPRESS_2DAY,
        serviceName: 'FedEx 2Day AM',
        rate: Number((18.5 + w * 3.5).toFixed(2)),
        estimatedDays: 2,
        guaranteed: true,
      },
      {
        carrier: ShippingCarrier.UPS,
        carrierName: 'UPS Logistics',
        serviceLevel: ServiceLevel.STANDARD_GROUND,
        serviceName: 'UPS Ground',
        rate: Number((8.95 + w * 2.1).toFixed(2)),
        estimatedDays: 3,
        guaranteed: false,
      },
      {
        carrier: ShippingCarrier.UPS,
        carrierName: 'UPS Logistics',
        serviceLevel: ServiceLevel.OVERNIGHT_PRIORITY,
        serviceName: 'UPS Next Day Air',
        rate: Number((32.0 + w * 4.8).toFixed(2)),
        estimatedDays: 1,
        guaranteed: true,
      },
      {
        carrier: ShippingCarrier.DHL,
        carrierName: 'DHL Express',
        serviceLevel: ServiceLevel.INTERNATIONAL_EXPEDITED,
        serviceName: 'DHL Express Worldwide',
        rate: Number((26.5 + w * 5.2).toFixed(2)),
        estimatedDays: 2,
        guaranteed: true,
      },
      {
        carrier: ShippingCarrier.USPS,
        carrierName: 'US Postal Service',
        serviceLevel: ServiceLevel.STANDARD_GROUND,
        serviceName: 'USPS Priority Mail',
        rate: Number((7.8 + w * 1.9).toFixed(2)),
        estimatedDays: 4,
        guaranteed: false,
      },
    ];
  }

  // ==========================================
  // CREATE DISPATCH & GENERATE 4x6 THERMAL LABEL
  // ==========================================
  async createDispatch(dto: CreateDispatchDto) {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) throw new NotFoundException(`Order ${dto.orderId} not found`);

    const warehouse = await this.warehouseModel.findById(dto.originWarehouseId);
    if (!warehouse) throw new NotFoundException(`Warehouse ${dto.originWarehouseId} not found`);

    const existing = await this.dispatchModel.findOne({ orderId: order._id.toString() });
    if (existing) {
      throw new BadRequestException(`Shipment already exists for order #${order.orderNumber}`);
    }

    const count = await this.dispatchModel.countDocuments();
    const shipmentNumber = `SHP-2026-${String(count + 8001).padStart(5, '0')}`;

    // Generate Carrier Specific Tracking Number & Routing
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    let trackingNumber = `TRK-${dto.carrier}-${randomSuffix}US`;
    if (dto.carrier === ShippingCarrier.UPS) {
      trackingNumber = `1Z99999903${randomSuffix}`;
    } else if (dto.carrier === ShippingCarrier.USPS) {
      trackingNumber = `940011189956${randomSuffix.toString().slice(0, 10)}`;
    }

    const rates = await this.calculateRates({ weightKg: dto.packageWeightKg });
    const matchedRate = rates.find(
      (r) => r.carrier === dto.carrier && r.serviceLevel === dto.serviceLevel,
    ) || rates[0];

    const customerName = order.customerName || 'Valued Customer';
    const customerEmail = order.customerEmail || 'customer@example.com';

    const destAddress = order.shippingAddress || {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      country: 'USA',
    };

    const routingCode = `${dto.carrier.substring(0, 3)}-${warehouse.code.split('-')[1] || 'HUB'}-AIR-09`;
    const thermalLabelBarcode = `*${trackingNumber}*`;

    const dispatch = new this.dispatchModel({
      _id: uuidv4(),
      shipmentNumber,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      customerName,
      customerEmail,
      shippingAddress: destAddress,
      originWarehouseId: warehouse._id,
      originWarehouseName: warehouse.name,
      carrier: dto.carrier,
      serviceLevel: dto.serviceLevel,
      packageWeightKg: dto.packageWeightKg,
      packageDimensions: dto.packageDimensions || { length: 30, width: 20, height: 15, unit: 'cm' },
      shippingCost: matchedRate.rate,
      trackingNumber,
      status: ShipmentStatus.MANIFEST_CREATED,
      trackingHistory: [
        {
          timestamp: new Date(),
          status: 'MANIFEST_CREATED',
          location: `${warehouse.address?.city || 'Hub'}, ${warehouse.address?.state || 'US'}`,
          message: `Shipping label created and electronic manifest transmitted to ${dto.carrier}.`,
        },
      ],
      routingCode,
      thermalLabelBarcode,
      dispatchedAt: new Date(),
      notes: dto.notes || '',
    });

    await dispatch.save();

    // Update order status to SHIPPED
    order.orderStatus = OrderStatus.SHIPPED;
    await order.save();

    return dispatch;
  }

  // ==========================================
  // MANIFESTS & TRACKING
  // ==========================================
  async findAllManifests(query?: { carrier?: string; status?: string }) {
    const filter: Record<string, any> = {};
    if (query?.carrier && query.carrier !== 'ALL') {
      filter.carrier = query.carrier;
    }
    if (query?.status && query.status !== 'ALL') {
      filter.status = query.status;
    }
    return this.dispatchModel.find(filter).sort({ dispatchedAt: -1 });
  }

  async findManifestById(id: string) {
    const m = await this.dispatchModel.findById(id);
    if (!m) throw new NotFoundException(`Manifest ${id} not found`);
    return m;
  }

  async getTracking(trackingNumber: string) {
    const dispatch = await this.dispatchModel.findOne({ trackingNumber });
    if (!dispatch) throw new NotFoundException(`Tracking #${trackingNumber} not found`);
    return dispatch;
  }

  // ==========================================
  // SIMULATE WEBHOOK / UPDATE TRACKING
  // ==========================================
  async simulateWebhook(dto: SimulateWebhookDto) {
    const dispatch = await this.dispatchModel.findOne({
      trackingNumber: dto.trackingNumber,
    });
    if (!dispatch) throw new NotFoundException(`Shipment ${dto.trackingNumber} not found`);

    let newStatus = dispatch.status;
    let message = dto.message || '';

    if (dto.status === 'PICKED_UP') {
      newStatus = ShipmentStatus.PICKED_UP;
      message = message || `Package picked up by ${dispatch.carrier} courier.`;
    } else if (dto.status === 'IN_TRANSIT') {
      newStatus = ShipmentStatus.IN_TRANSIT;
      message = message || 'In transit to destination sort facility.';
    } else if (dto.status === 'OUT_FOR_DELIVERY') {
      newStatus = ShipmentStatus.OUT_FOR_DELIVERY;
      message = message || 'Out for delivery on courier vehicle.';
    } else if (dto.status === 'DELIVERED') {
      newStatus = ShipmentStatus.DELIVERED;
      message = message || 'Delivered to recipient address. Signed at front door.';
      dispatch.deliveredAt = new Date();

      // Update Order to DELIVERED
      await this.orderModel.findByIdAndUpdate(dispatch.orderId, {
        orderStatus: OrderStatus.DELIVERED,
      });
    }

    dispatch.status = newStatus;
    dispatch.trackingHistory.push({
      timestamp: new Date(),
      status: dto.status,
      location: dto.location || 'Regional Sorting Center',
      message,
    });

    await dispatch.save();

    // Log in webhook logs
    const webhookLog = new this.webhookModel({
      _id: uuidv4(),
      carrier: dispatch.carrier,
      trackingNumber: dispatch.trackingNumber,
      event: dto.status,
      location: dto.location || 'Regional Sort Hub',
      rawPayload: {
        trackingNumber: dispatch.trackingNumber,
        status: dto.status,
        timestamp: new Date().toISOString(),
        carrier: dispatch.carrier,
        eventDescription: message,
      },
      receivedAt: new Date(),
    });
    await webhookLog.save();

    return {
      success: true,
      shipment: dispatch,
      webhookLog,
    };
  }

  async findAllWebhooks() {
    return this.webhookModel.find().sort({ receivedAt: -1 }).limit(50);
  }
}
