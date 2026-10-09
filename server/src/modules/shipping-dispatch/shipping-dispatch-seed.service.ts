import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
import { Warehouse, WarehouseDocument } from '../warehouses/schemas/warehouse.schema';

@Injectable()
export class ShippingDispatchSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ShippingDispatchSeedService.name);

  constructor(
    @InjectModel(ShipmentDispatch.name)
    private readonly dispatchModel: Model<ShipmentDispatchDocument>,
    @InjectModel(CarrierWebhook.name)
    private readonly webhookModel: Model<CarrierWebhookDocument>,
    @InjectModel(Warehouse.name)
    private readonly warehouseModel: Model<WarehouseDocument>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.dispatchModel.countDocuments();
    if (count > 0) {
      return;
    }

    this.logger.log('Seeding premier Shipping Dispatches, 4x6 Thermal Manifests, and Courier Webhooks...');

    const eastWarehouse = await this.warehouseModel.findOne({ code: 'WH-US-EAST' });
    const westWarehouse = await this.warehouseModel.findOne({ code: 'WH-US-WEST' });

    const whEastId = eastWarehouse?._id || 'wh-east-01';
    const whEastName = eastWarehouse?.name || 'US East Mega Distribution Center';

    const whWestId = westWarehouse?._id || 'wh-west-01';
    const whWestName = westWarehouse?.name || 'US West Regional Hub';

    const dispatchesData = [
      {
        _id: 'shp-2026-09001',
        shipmentNumber: 'SHP-2026-09001',
        orderId: 'ord-seed-01',
        orderNumber: 'ORD-2026-10492',
        customerName: 'Marcus Aurelius Vance',
        customerEmail: 'm.vance@example.com',
        shippingAddress: {
          street: '1048 Fifth Avenue, Apt 14B',
          city: 'New York',
          state: 'NY',
          postalCode: '10028',
          country: 'USA',
        },
        originWarehouseId: whEastId,
        originWarehouseName: whEastName,
        carrier: ShippingCarrier.FEDEX,
        serviceLevel: ServiceLevel.EXPRESS_2DAY,
        packageWeightKg: 2.1,
        packageDimensions: { length: 32, width: 22, height: 16, unit: 'cm' },
        shippingCost: 24.5,
        trackingNumber: 'TRK-FDX-77492019US',
        status: ShipmentStatus.IN_TRANSIT,
        trackingHistory: [
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'MANIFEST_CREATED',
            location: 'Newark Sort Hub, NJ',
            message: 'Electronic shipping data received and thermal label printed.',
          },
          {
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
            status: 'PICKED_UP',
            location: 'Newark Sort Hub, NJ',
            message: 'Picked up by FedEx Express courier trailer.',
          },
          {
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'IN_TRANSIT',
            location: 'Queens Regional Hub, NY',
            message: 'Departed transit sort center; on schedule for delivery.',
          },
        ],
        routingCode: 'FDX-EAS-AIR-09',
        thermalLabelBarcode: '*TRK-FDX-77492019US*',
        dispatchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        notes: 'Fragile electronic equipment. Signature required on delivery.',
      },
      {
        _id: 'shp-2026-09002',
        shipmentNumber: 'SHP-2026-09002',
        orderId: 'ord-seed-02',
        orderNumber: 'ORD-2026-10493',
        customerName: 'Sarah Jenkins',
        customerEmail: 'sarah.jenkins@example.com',
        shippingAddress: {
          street: '340 Montgomery St, Suite 500',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94104',
          country: 'USA',
        },
        originWarehouseId: whWestId,
        originWarehouseName: whWestName,
        carrier: ShippingCarrier.UPS,
        serviceLevel: ServiceLevel.OVERNIGHT_PRIORITY,
        packageWeightKg: 1.4,
        packageDimensions: { length: 28, width: 18, height: 12, unit: 'cm' },
        shippingCost: 38.0,
        trackingNumber: '1Z9999990382910482',
        status: ShipmentStatus.OUT_FOR_DELIVERY,
        trackingHistory: [
          {
            timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
            status: 'MANIFEST_CREATED',
            location: 'Ontario Hub, CA',
            message: 'Shipping label created.',
          },
          {
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            status: 'PICKED_UP',
            location: 'Ontario Hub, CA',
            message: 'Package scanned at hub.',
          },
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'OUT_FOR_DELIVERY',
            location: 'San Francisco, CA',
            message: 'Loaded onto courier delivery vehicle. Delivery by 3:00 PM.',
          },
        ],
        routingCode: 'UPS-WST-NEXT-01',
        thermalLabelBarcode: '*1Z9999990382910482*',
        dispatchedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
        notes: 'Priority air courier. Deliver to office reception.',
      },
      {
        _id: 'shp-2026-09003',
        shipmentNumber: 'SHP-2026-09003',
        orderId: 'ord-seed-03',
        orderNumber: 'ORD-2026-10494',
        customerName: 'Alexander Wright',
        customerEmail: 'a.wright@example.com',
        shippingAddress: {
          street: '72 Pall Mall',
          city: 'London',
          state: 'Greater London',
          postalCode: 'SW1Y 5ES',
          country: 'UK',
        },
        originWarehouseId: whEastId,
        originWarehouseName: whEastName,
        carrier: ShippingCarrier.DHL,
        serviceLevel: ServiceLevel.INTERNATIONAL_EXPEDITED,
        packageWeightKg: 3.5,
        packageDimensions: { length: 40, width: 30, height: 20, unit: 'cm' },
        shippingCost: 52.0,
        trackingNumber: 'TRK-DHL-89201948UK',
        status: ShipmentStatus.DELIVERED,
        trackingHistory: [
          {
            timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
            status: 'MANIFEST_CREATED',
            location: 'JFK Gateway, NY',
            message: 'Customs declaration transmitted electronically.',
          },
          {
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
            status: 'IN_TRANSIT',
            location: 'Heathrow Airport Hub, UK',
            message: 'Customs clearance processed successfully.',
          },
          {
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'DELIVERED',
            location: 'London, UK',
            message: 'Delivered and signed by Concierge: J. Smith.',
          },
        ],
        routingCode: 'DHL-INT-HEATHROW',
        thermalLabelBarcode: '*TRK-DHL-89201948UK*',
        dispatchedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        notes: 'International duties prepaid (DDP).',
      },
    ];

    await this.dispatchModel.insertMany(dispatchesData);

    const webhooksData = [
      {
        _id: 'whk-001',
        carrier: 'FEDEX',
        trackingNumber: 'TRK-FDX-77492019US',
        event: 'IN_TRANSIT',
        location: 'Queens Regional Hub, NY',
        rawPayload: {
          code: 'IT_SCAN',
          city: 'Queens',
          carrier: 'FEDEX',
          timestamp: new Date().toISOString(),
        },
        receivedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        _id: 'whk-002',
        carrier: 'UPS',
        trackingNumber: '1Z9999990382910482',
        event: 'OUT_FOR_DELIVERY',
        location: 'San Francisco, CA',
        rawPayload: {
          code: 'OUT_VAN',
          city: 'San Francisco',
          carrier: 'UPS',
          timestamp: new Date().toISOString(),
        },
        receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        _id: 'whk-003',
        carrier: 'DHL',
        trackingNumber: 'TRK-DHL-89201948UK',
        event: 'DELIVERED',
        location: 'London, UK',
        rawPayload: {
          code: 'DLV_SIGN',
          signedBy: 'J. Smith',
          carrier: 'DHL',
          timestamp: new Date().toISOString(),
        },
        receivedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ];

    await this.webhookModel.insertMany(webhooksData);

    this.logger.log('Successfully seeded Shipping Dispatches and Webhook event logs.');
  }
}
