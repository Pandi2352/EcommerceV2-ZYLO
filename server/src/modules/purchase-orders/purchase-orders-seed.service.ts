import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Supplier, SupplierDocument, PaymentTerms, SupplierStatus } from './schemas/supplier.schema';
import { PurchaseOrder, PurchaseOrderDocument, POStatus, POPaymentStatus } from './schemas/purchase-order.schema';
import { ReceivingDock, ReceivingDockDocument } from './schemas/receiving-dock.schema';
import { Warehouse, WarehouseDocument } from '../warehouses/schemas/warehouse.schema';

@Injectable()
export class PurchaseOrdersSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PurchaseOrdersSeedService.name);

  constructor(
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(PurchaseOrder.name)
    private readonly poModel: Model<PurchaseOrderDocument>,
    @InjectModel(ReceivingDock.name)
    private readonly dockModel: Model<ReceivingDockDocument>,
    @InjectModel(Warehouse.name)
    private readonly warehouseModel: Model<WarehouseDocument>,
  ) {}

  async onApplicationBootstrap() {
    const supplierCount = await this.supplierModel.countDocuments();
    if (supplierCount > 0) {
      return;
    }

    this.logger.log('Seeding premier Suppliers, Purchase Orders, and Dock Receipts...');

    const eastWarehouse = await this.warehouseModel.findOne({ code: 'WH-US-EAST' });
    const westWarehouse = await this.warehouseModel.findOne({ code: 'WH-US-WEST' });

    const whEastId = eastWarehouse?._id || 'wh-east-01';
    const whEastName = eastWarehouse?.name || 'US East Mega Distribution Center';
    const whEastCode = eastWarehouse?.code || 'WH-US-EAST';

    const whWestId = westWarehouse?._id || 'wh-west-01';
    const whWestName = westWarehouse?.name || 'US West Regional Hub';
    const whWestCode = westWarehouse?.code || 'WH-US-WEST';

    // 1. Seed Suppliers
    const suppliersData = [
      {
        _id: 'sup-apex-01',
        code: 'SUP-APEX',
        name: 'Apex Semiconductor & Audio Dynamics',
        contactPerson: 'David Chen',
        email: 'procurement@apex-audio.com',
        phone: '+1 (408) 555-0192',
        address: {
          street: '4200 Innovation Way',
          city: 'San Jose',
          state: 'CA',
          postalCode: '95134',
          country: 'USA',
        },
        paymentTerms: PaymentTerms.NET_30,
        leadTimeDays: 5,
        status: SupplierStatus.ACTIVE,
        rating: 4.9,
        taxId: 'US-94-3829102',
        notes: 'Tier 1 primary supplier for high-fidelity audio equipment and components.',
      },
      {
        _id: 'sup-velo-02',
        code: 'SUP-VELO',
        name: 'Velona Performance Apparel & Textiles',
        contactPerson: 'Elena Rostova',
        email: 'supply@velona-textiles.com',
        phone: '+1 (503) 555-8321',
        address: {
          street: '880 Cascade Parkway',
          city: 'Portland',
          state: 'OR',
          postalCode: '97201',
          country: 'USA',
        },
        paymentTerms: PaymentTerms.NET_60,
        leadTimeDays: 9,
        status: SupplierStatus.ACTIVE,
        rating: 4.7,
        taxId: 'US-93-1029482',
        notes: 'Manufactures thermal fleece fabrics and weather-resistant outerwear.',
      },
      {
        _id: 'sup-nord-03',
        code: 'SUP-NORD',
        name: 'Nordic Artisan Leatherworks AB',
        contactPerson: 'Frederik Lindqvist',
        email: 'b2b@nordic-leather.se',
        phone: '+46 8 555 9200',
        address: {
          street: 'Hamngatan 14',
          city: 'Stockholm',
          state: 'Stockholm',
          postalCode: '111 47',
          country: 'Sweden',
        },
        paymentTerms: PaymentTerms.ADVANCE_50,
        leadTimeDays: 14,
        status: SupplierStatus.ACTIVE,
        rating: 4.8,
        taxId: 'SE-5561234567',
        notes: 'Full-grain vegetable-tanned leather goods and travel accessories.',
      },
      {
        _id: 'sup-titan-04',
        code: 'SUP-TITAN',
        name: 'Titan Hardware & Smart Robotics Ltd',
        contactPerson: 'Marcus Thorne',
        email: 'orders@titan-tech.co.uk',
        phone: '+44 20 7946 0912',
        address: {
          street: '22 Bishopsgate',
          city: 'London',
          state: 'Greater London',
          postalCode: 'EC2N 4BQ',
          country: 'UK',
        },
        paymentTerms: PaymentTerms.NET_30,
        leadTimeDays: 7,
        status: SupplierStatus.ACTIVE,
        rating: 4.6,
        taxId: 'GB-992019284',
        notes: 'Smart home sensors, robotics accessories, and packaging hardware.',
      },
    ];

    await this.supplierModel.insertMany(suppliersData);

    // 2. Seed Purchase Orders
    const poData = [
      {
        _id: 'po-2026-01001',
        poNumber: 'PO-2026-01001',
        supplierId: 'sup-apex-01',
        supplierName: 'Apex Semiconductor & Audio Dynamics',
        supplierCode: 'SUP-APEX',
        destinationWarehouseId: whEastId,
        destinationWarehouseCode: whEastCode,
        destinationWarehouseName: whEastName,
        items: [
          {
            productId: 'prod-airpods-max',
            sku: 'APM-SG-01',
            name: 'Apple AirPods Max - Space Gray',
            orderedQty: 100,
            receivedQty: 100,
            unitCost: 380,
            totalCost: 38000,
          },
          {
            productId: 'prod-bose-700',
            sku: 'BSE-700-SLV',
            name: 'Bose Noise Cancelling Headphones 700',
            orderedQty: 50,
            receivedQty: 50,
            unitCost: 240,
            totalCost: 12000,
          },
        ],
        subtotal: 50000,
        shippingCost: 850,
        taxAmount: 2500,
        totalAmount: 53350,
        status: POStatus.RECEIVED,
        paymentStatus: POPaymentStatus.PAID,
        issuedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        receivedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        createdBy: 'Chief Procurement Officer',
        notes: 'Priority air freight received in full and inspected at dock.',
      },
      {
        _id: 'po-2026-01002',
        poNumber: 'PO-2026-01002',
        supplierId: 'sup-velo-02',
        supplierName: 'Velona Performance Apparel & Textiles',
        supplierCode: 'SUP-VELO',
        destinationWarehouseId: whWestId,
        destinationWarehouseCode: whWestCode,
        destinationWarehouseName: whWestName,
        items: [
          {
            productId: 'prod-tech-fleece',
            sku: 'NK-TF-BLK-M',
            name: 'Nike Sportswear Tech Fleece Windrunner (M)',
            orderedQty: 250,
            receivedQty: 150,
            unitCost: 65,
            totalCost: 16250,
          },
          {
            productId: 'prod-tech-fleece',
            sku: 'NK-TF-BLK-L',
            name: 'Nike Sportswear Tech Fleece Windrunner (L)',
            orderedQty: 200,
            receivedQty: 100,
            unitCost: 65,
            totalCost: 13000,
          },
        ],
        subtotal: 29250,
        shippingCost: 600,
        taxAmount: 1462.5,
        totalAmount: 31312.5,
        status: POStatus.PARTIALLY_RECEIVED,
        paymentStatus: POPaymentStatus.PARTIALLY_PAID,
        issuedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdBy: 'Inventory Planning Manager',
        notes: 'First container cleared and checked in. Second shipment arriving in 48 hours.',
      },
      {
        _id: 'po-2026-01003',
        poNumber: 'PO-2026-01003',
        supplierId: 'sup-nord-03',
        supplierName: 'Nordic Artisan Leatherworks AB',
        supplierCode: 'SUP-NORD',
        destinationWarehouseId: whEastId,
        destinationWarehouseCode: whEastCode,
        destinationWarehouseName: whEastName,
        items: [
          {
            productId: 'prod-leather-duffle',
            sku: 'NLW-DUF-COGNAC',
            name: 'Nordic Heritage Leather Weekender Duffle',
            orderedQty: 80,
            receivedQty: 0,
            unitCost: 185,
            totalCost: 14800,
          },
        ],
        subtotal: 14800,
        shippingCost: 1100,
        taxAmount: 740,
        totalAmount: 16640,
        status: POStatus.ISSUED,
        paymentStatus: POPaymentStatus.PARTIALLY_PAID,
        issuedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        createdBy: 'Procurement Specialist',
        notes: 'Vessel in transit across Atlantic; customs broker notified.',
      },
      {
        _id: 'po-2026-01004',
        poNumber: 'PO-2026-01004',
        supplierId: 'sup-titan-04',
        supplierName: 'Titan Hardware & Smart Robotics Ltd',
        supplierCode: 'SUP-TITAN',
        destinationWarehouseId: whWestId,
        destinationWarehouseCode: whWestCode,
        destinationWarehouseName: whWestName,
        items: [
          {
            productId: 'prod-smart-sensor',
            sku: 'TTN-SNS-01',
            name: 'Titan Ambient IoT Environmental Sensor Pack',
            orderedQty: 300,
            receivedQty: 0,
            unitCost: 28,
            totalCost: 8400,
          },
        ],
        subtotal: 8400,
        shippingCost: 350,
        taxAmount: 420,
        totalAmount: 9170,
        status: POStatus.DRAFT,
        paymentStatus: POPaymentStatus.UNPAID,
        issuedAt: new Date(),
        expectedDeliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdBy: 'Warehouse Logistics Supervisor',
        notes: 'Pending final review and signature from finance controller.',
      },
    ];

    await this.poModel.insertMany(poData);

    // 3. Seed Receiving Dock Inspection Receipt
    const receiptsData = [
      {
        _id: 'rcv-2026-00501',
        receiptNumber: 'RCV-2026-00501',
        poId: 'po-2026-01001',
        poNumber: 'PO-2026-01001',
        supplierName: 'Apex Semiconductor & Audio Dynamics',
        warehouseId: whEastId,
        warehouseName: whEastName,
        dockBay: 'Bay 3 - Inbound Air Cargo',
        inspectorName: 'Carlos Ramirez',
        items: [
          {
            sku: 'APM-SG-01',
            name: 'Apple AirPods Max - Space Gray',
            deliveredQty: 100,
            acceptedQty: 100,
            rejectedQty: 0,
            rejectionReason: '',
          },
          {
            sku: 'BSE-700-SLV',
            name: 'Bose Noise Cancelling Headphones 700',
            deliveredQty: 50,
            acceptedQty: 50,
            rejectedQty: 0,
            rejectionReason: '',
          },
        ],
        passedInspection: true,
        notes: 'All tamper-proof seals intact; barcode verification 100% matched.',
        receivedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'rcv-2026-00502',
        receiptNumber: 'RCV-2026-00502',
        poId: 'po-2026-01002',
        poNumber: 'PO-2026-01002',
        supplierName: 'Velona Performance Apparel & Textiles',
        warehouseId: whWestId,
        warehouseName: whWestName,
        dockBay: 'Bay 1 - Inbound Freight',
        inspectorName: 'Samantha Green',
        items: [
          {
            sku: 'NK-TF-BLK-M',
            name: 'Nike Sportswear Tech Fleece Windrunner (M)',
            deliveredQty: 150,
            acceptedQty: 150,
            rejectedQty: 0,
            rejectionReason: '',
          },
          {
            sku: 'NK-TF-BLK-L',
            name: 'Nike Sportswear Tech Fleece Windrunner (L)',
            deliveredQty: 100,
            acceptedQty: 100,
            rejectedQty: 0,
            rejectionReason: '',
          },
        ],
        passedInspection: true,
        notes: 'Pallet 1 of 2 cleared inspection and binned into Aisles 4 & 5.',
        receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    await this.dockModel.insertMany(receiptsData);

    this.logger.log('Successfully seeded 4 Suppliers, 4 Purchase Orders, and 2 Dock Inspection Receipts.');
  }
}
