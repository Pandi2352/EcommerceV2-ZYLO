import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Warehouse, WarehouseDocument } from './schemas/warehouse.schema';
import { StockTransfer, StockTransferDocument } from './schemas/stock-transfer.schema';
import { WarehouseInventory, WarehouseInventoryDocument } from './schemas/warehouse-inventory.schema';
import { WarehouseType, WarehouseStatus, TransferStatus } from './enums/warehouse.enums';

@Injectable()
export class WarehousesSeedService implements OnModuleInit {
  private readonly logger = new Logger(WarehousesSeedService.name);

  constructor(
    @InjectModel(Warehouse.name) private readonly warehouseModel: Model<WarehouseDocument>,
    @InjectModel(StockTransfer.name) private readonly transferModel: Model<StockTransferDocument>,
    @InjectModel(WarehouseInventory.name) private readonly inventoryModel: Model<WarehouseInventoryDocument>,
  ) {}

  async onModuleInit() {
    await this.seedWarehousesAndTransfers();
  }

  async seedWarehousesAndTransfers() {
    const count = await this.warehouseModel.countDocuments();
    if (count > 0) return;

    this.logger.log('Seeding initial fulfillment centers and warehouse inventory...');

    const whEastId = 'wh-001-us-east-nj';
    const whWestId = 'wh-002-us-west-ca';
    const whEuId = 'wh-003-eu-central-de';
    const whApId = 'wh-004-ap-south-in';

    const warehousesToSeed = [
      {
        _id: whEastId,
        code: 'WH-US-EAST',
        name: 'US East Central Fulfillment Center',
        type: WarehouseType.PRIMARY_DISTRIBUTION,
        status: WarehouseStatus.ACTIVE,
        isDefault: true,
        address: {
          street: '100 Distribution Blvd, Suite 400',
          city: 'Edison',
          state: 'NJ',
          postalCode: '08817',
          country: 'United States',
          latitude: 40.5187,
          longitude: -74.4121,
        },
        contactPerson: 'David Miller',
        contactEmail: 'david.miller@zylo.com',
        contactPhone: '+1 (732) 555-0192',
        capacitySqFt: 150000,
        operatingHours: '24/7 Operations',
        servicedRegions: ['NY', 'NJ', 'PA', 'CT', 'MA', 'MD', 'VA'],
        totalInventoryUnits: 68400,
        activeTransfersCount: 1,
        is_deleted: false,
      },
      {
        _id: whWestId,
        code: 'WH-US-WEST',
        name: 'Pacific West Coast Logistics Hub',
        type: WarehouseType.REGIONAL_HUB,
        status: WarehouseStatus.ACTIVE,
        isDefault: false,
        address: {
          street: '4500 Inland Empire Way',
          city: 'Ontario',
          state: 'CA',
          postalCode: '91761',
          country: 'United States',
          latitude: 34.0633,
          longitude: -117.6509,
        },
        contactPerson: 'Sarah Lin',
        contactEmail: 'sarah.lin@zylo.com',
        contactPhone: '+1 (909) 555-0143',
        capacitySqFt: 95000,
        operatingHours: 'Mon - Sat: 6:00 AM - 10:00 PM PST',
        servicedRegions: ['CA', 'OR', 'WA', 'NV', 'AZ', 'UT'],
        totalInventoryUnits: 34200,
        activeTransfersCount: 1,
        is_deleted: false,
      },
      {
        _id: whEuId,
        code: 'WH-EU-CENTRAL',
        name: 'European Central Logistics Center',
        type: WarehouseType.REGIONAL_HUB,
        status: WarehouseStatus.ACTIVE,
        isDefault: false,
        address: {
          street: 'Flughafenfrachtstraße 12',
          city: 'Frankfurt am Main',
          state: 'Hessen',
          postalCode: '60549',
          country: 'Germany',
          latitude: 50.0379,
          longitude: 8.5622,
        },
        contactPerson: 'Hans Weber',
        contactEmail: 'hans.weber@zylo.com',
        contactPhone: '+49 69 555 0182',
        capacitySqFt: 75000,
        operatingHours: 'Mon - Fri: 7:00 AM - 8:00 PM CET',
        servicedRegions: ['DE', 'FR', 'NL', 'BE', 'AT', 'CH'],
        totalInventoryUnits: 18900,
        activeTransfersCount: 0,
        is_deleted: false,
      },
      {
        _id: whApId,
        code: 'WH-AP-SOUTH',
        name: 'Asia-Pacific Regional Fulfillment Hub',
        type: WarehouseType.REGIONAL_HUB,
        status: WarehouseStatus.ACTIVE,
        isDefault: false,
        address: {
          street: 'Outer Ring Road, Marathahalli Logistics Park',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          country: 'India',
          latitude: 12.9352,
          longitude: 77.6946,
        },
        contactPerson: 'Rajesh Kumar',
        contactEmail: 'rajesh.kumar@zylo.com',
        contactPhone: '+91 80 555 0199',
        capacitySqFt: 60000,
        operatingHours: 'Mon - Sat: 8:00 AM - 9:00 PM IST',
        servicedRegions: ['IN', 'SG', 'MY', 'AE'],
        totalInventoryUnits: 14500,
        activeTransfersCount: 0,
        is_deleted: false,
      },
    ];

    for (const wh of warehousesToSeed) {
      await this.warehouseModel.create(wh);
    }

    // Seed sample Stock Transfers
    const transfersToSeed = [
      {
        _id: uuidv4(),
        transferNumber: 'TRF-2026-0001',
        sourceWarehouseId: whEastId,
        sourceWarehouseName: 'US East Central Fulfillment Center',
        destinationWarehouseId: whWestId,
        destinationWarehouseName: 'Pacific West Coast Logistics Hub',
        status: TransferStatus.IN_TRANSIT,
        items: [
          {
            sku: 'MBP16-SG-32-1TB',
            productName: 'Apple MacBook Pro 16"',
            variantTitle: 'Space Gray, 32GB RAM, 1TB SSD',
            requestedQty: 50,
            shippedQty: 50,
            receivedQty: 0,
          },
          {
            sku: 'LOGI-MX3S-GRY',
            productName: 'Logitech MX Master 3S',
            variantTitle: 'Pale Gray',
            requestedQty: 100,
            shippedQty: 100,
            receivedQty: 0,
          },
        ],
        totalItemsCount: 2,
        totalQuantity: 150,
        carrier: 'FedEx National Freight',
        trackingNumber: 'FDX-8829104812',
        estimatedArrival: new Date(Date.now() + 86400000 * 2),
        shippedAt: new Date(Date.now() - 86400000 * 1),
        notes: 'Priority West Coast regional restock for holiday surge.',
        createdBy: 'David Miller',
        is_deleted: false,
      },
      {
        _id: uuidv4(),
        transferNumber: 'TRF-2026-0002',
        sourceWarehouseId: whWestId,
        sourceWarehouseName: 'Pacific West Coast Logistics Hub',
        destinationWarehouseId: whEastId,
        destinationWarehouseName: 'US East Central Fulfillment Center',
        status: TransferStatus.COMPLETED,
        items: [
          {
            sku: 'SONY-WH1000XM5-BLK',
            productName: 'Sony WH-1000XM5 Noise Canceling Headphones',
            variantTitle: 'Midnight Black',
            requestedQty: 80,
            shippedQty: 80,
            receivedQty: 80,
          },
        ],
        totalItemsCount: 1,
        totalQuantity: 80,
        carrier: 'UPS Ground Freight',
        trackingNumber: '1Z9999999999999999',
        estimatedArrival: new Date(Date.now() - 86400000 * 2),
        shippedAt: new Date(Date.now() - 86400000 * 5),
        receivedAt: new Date(Date.now() - 86400000 * 2),
        notes: 'Excess inventory balancing.',
        createdBy: 'Sarah Lin',
        receivedBy: 'David Miller',
        is_deleted: false,
      },
      {
        _id: uuidv4(),
        transferNumber: 'TRF-2026-0003',
        sourceWarehouseId: whEastId,
        sourceWarehouseName: 'US East Central Fulfillment Center',
        destinationWarehouseId: whEuId,
        destinationWarehouseName: 'European Central Logistics Center',
        status: TransferStatus.PENDING_APPROVAL,
        items: [
          {
            sku: 'DELL-U2723QE-4K',
            productName: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
            variantTitle: 'Platinum Silver',
            requestedQty: 40,
            shippedQty: 0,
            receivedQty: 0,
          },
        ],
        totalItemsCount: 1,
        totalQuantity: 40,
        carrier: 'DHL Global Forwarding',
        trackingNumber: 'DHL-GF-772183',
        estimatedArrival: new Date(Date.now() + 86400000 * 7),
        notes: 'Cross-Atlantic replenishment awaiting export documentation.',
        createdBy: 'David Miller',
        is_deleted: false,
      },
    ];

    for (const t of transfersToSeed) {
      await this.transferModel.create(t);
    }

    // Seed sample inventory per warehouse
    const inventoryItems = [
      {
        _id: uuidv4(),
        warehouseId: whEastId,
        sku: 'MBP16-SG-32-1TB',
        productName: 'Apple MacBook Pro 16"',
        variantTitle: 'Space Gray, 32GB RAM, 1TB SSD',
        quantity: 140,
        reservedQuantity: 12,
        safetyStock: 25,
        binLocation: 'Aisle 04, Rack B, Bin 01',
      },
      {
        _id: uuidv4(),
        warehouseId: whEastId,
        sku: 'LOGI-MX3S-GRY',
        productName: 'Logitech MX Master 3S',
        variantTitle: 'Pale Gray',
        quantity: 320,
        reservedQuantity: 28,
        safetyStock: 50,
        binLocation: 'Aisle 02, Rack A, Bin 14',
      },
      {
        _id: uuidv4(),
        warehouseId: whWestId,
        sku: 'SONY-WH1000XM5-BLK',
        productName: 'Sony WH-1000XM5 Noise Canceling Headphones',
        variantTitle: 'Midnight Black',
        quantity: 95,
        reservedQuantity: 6,
        safetyStock: 20,
        binLocation: 'Aisle 01, Rack C, Bin 08',
      },
    ];

    for (const inv of inventoryItems) {
      await this.inventoryModel.create(inv);
    }

    this.logger.log('Seeded 4 fulfillment centers, 3 stock transfer manifests, and inventory records successfully.');
  }
}
