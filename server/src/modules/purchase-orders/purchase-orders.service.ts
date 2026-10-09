import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Supplier, SupplierDocument, SupplierStatus } from './schemas/supplier.schema';
import {
  PurchaseOrder,
  PurchaseOrderDocument,
  POStatus,
  POPaymentStatus,
} from './schemas/purchase-order.schema';
import {
  ReceivingDock,
  ReceivingDockDocument,
} from './schemas/receiving-dock.schema';
import {
  Warehouse,
  WarehouseDocument,
} from '../warehouses/schemas/warehouse.schema';
import {
  WarehouseInventory,
  WarehouseInventoryDocument,
} from '../warehouses/schemas/warehouse-inventory.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceiveDockShipmentDto } from './dto/dock-inspection.dto';

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name);

  constructor(
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(PurchaseOrder.name)
    private readonly poModel: Model<PurchaseOrderDocument>,
    @InjectModel(ReceivingDock.name)
    private readonly dockModel: Model<ReceivingDockDocument>,
    @InjectModel(Warehouse.name)
    private readonly warehouseModel: Model<WarehouseDocument>,
    @InjectModel(WarehouseInventory.name)
    private readonly inventoryModel: Model<WarehouseInventoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  // ==========================================
  // METRICS & DASHBOARD
  // ==========================================
  async getMetrics() {
    const [totalSuppliers, activeSuppliers] = await Promise.all([
      this.supplierModel.countDocuments(),
      this.supplierModel.countDocuments({ status: SupplierStatus.ACTIVE }),
    ]);

    const pos = await this.poModel.find();
    let totalSpend = 0;
    let openPOCount = 0;
    let pendingReceivingCount = 0;
    let completedCount = 0;

    for (const po of pos) {
      totalSpend += po.totalAmount || 0;
      if (po.status === POStatus.DRAFT || po.status === POStatus.ISSUED) {
        openPOCount++;
      }
      if (
        po.status === POStatus.ISSUED ||
        po.status === POStatus.PARTIALLY_RECEIVED
      ) {
        pendingReceivingCount++;
      }
      if (po.status === POStatus.RECEIVED) {
        completedCount++;
      }
    }

    return {
      totalSuppliers,
      activeSuppliers,
      totalPOs: pos.length,
      openPOCount,
      pendingReceivingCount,
      completedCount,
      totalSpend,
    };
  }

  // ==========================================
  // SUPPLIERS CRUD
  // ==========================================
  async findAllSuppliers() {
    return this.supplierModel.find().sort({ createdAt: -1 });
  }

  async findSupplierById(id: string) {
    const s = await this.supplierModel.findById(id);
    if (!s) throw new NotFoundException(`Supplier ${id} not found`);
    return s;
  }

  async createSupplier(dto: CreateSupplierDto) {
    const existing = await this.supplierModel.findOne({
      code: dto.code.toUpperCase().trim(),
    });
    if (existing) {
      throw new BadRequestException(
        `Supplier with code ${dto.code} already exists`,
      );
    }

    const supplier = new this.supplierModel({
      _id: uuidv4(),
      ...dto,
      code: dto.code.toUpperCase().trim(),
    });

    return supplier.save();
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto) {
    const s = await this.supplierModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );
    if (!s) throw new NotFoundException(`Supplier ${id} not found`);
    return s;
  }

  async deleteSupplier(id: string) {
    const hasPOs = await this.poModel.exists({ supplierId: id });
    if (hasPOs) {
      throw new BadRequestException(
        'Cannot delete supplier with associated Purchase Orders. Deactivate instead.',
      );
    }
    const res = await this.supplierModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException(`Supplier ${id} not found`);
    return { success: true, message: 'Supplier deleted successfully' };
  }

  // ==========================================
  // PURCHASE ORDERS
  // ==========================================
  async findAllPOs(query?: { status?: string; supplierId?: string }) {
    const filter: Record<string, any> = {};
    if (query?.status && query.status !== 'ALL') {
      filter.status = query.status;
    }
    if (query?.supplierId && query.supplierId !== 'ALL') {
      filter.supplierId = query.supplierId;
    }
    return this.poModel.find(filter).sort({ createdAt: -1 });
  }

  async findPOById(id: string) {
    const po = await this.poModel.findById(id);
    if (!po) throw new NotFoundException(`Purchase Order ${id} not found`);
    return po;
  }

  async createPO(dto: CreatePurchaseOrderDto, createdBy = 'Admin') {
    const [supplier, warehouse] = await Promise.all([
      this.supplierModel.findById(dto.supplierId),
      this.warehouseModel.findById(dto.destinationWarehouseId),
    ]);

    if (!supplier) throw new NotFoundException('Selected supplier not found');
    if (!warehouse) throw new NotFoundException('Selected destination warehouse not found');

    const poCount = await this.poModel.countDocuments();
    const poNumber = `PO-2026-${String(poCount + 1001).padStart(5, '0')}`;

    let subtotal = 0;
    const items = dto.items.map((it) => {
      const lineCost = Number((it.orderedQty * it.unitCost).toFixed(2));
      subtotal += lineCost;
      return {
        ...it,
        receivedQty: 0,
        totalCost: lineCost,
      };
    });

    const shippingCost = dto.shippingCost || 0;
    const taxAmount = dto.taxAmount || 0;
    const totalAmount = Number((subtotal + shippingCost + taxAmount).toFixed(2));

    const po = new this.poModel({
      _id: uuidv4(),
      poNumber,
      supplierId: supplier._id,
      supplierName: supplier.name,
      supplierCode: supplier.code,
      destinationWarehouseId: warehouse._id,
      destinationWarehouseCode: warehouse.code,
      destinationWarehouseName: warehouse.name,
      items,
      subtotal,
      shippingCost,
      taxAmount,
      totalAmount,
      status: POStatus.ISSUED,
      paymentStatus: POPaymentStatus.UNPAID,
      issuedAt: new Date(),
      expectedDeliveryDate: dto.expectedDeliveryDate
        ? new Date(dto.expectedDeliveryDate)
        : new Date(Date.now() + (supplier.leadTimeDays || 7) * 24 * 60 * 60 * 1000),
      createdBy,
      notes: dto.notes || '',
    });

    return po.save();
  }

  async updatePOStatus(id: string, status: POStatus) {
    const po = await this.findPOById(id);
    po.status = status;
    if (status === POStatus.RECEIVED) {
      po.receivedAt = new Date();
    }
    return po.save();
  }

  // ==========================================
  // RECEIVING DOCK GOODS INSPECTION
  // ==========================================
  async receiveDockShipment(dto: ReceiveDockShipmentDto, inspector = 'Lead Inspector') {
    const po = await this.findPOById(dto.poId);
    if (po.status === POStatus.RECEIVED || po.status === POStatus.CANCELLED) {
      throw new BadRequestException(`Cannot receive against PO with status ${po.status}`);
    }

    const receiptCount = await this.dockModel.countDocuments();
    const receiptNumber = `RCV-2026-${String(receiptCount + 501).padStart(5, '0')}`;

    // Update PO item received counts & warehouse inventory
    let allReceived = true;
    for (const dockItem of dto.items) {
      const targetLine = po.items.find((i) => i.sku === dockItem.sku);
      if (targetLine) {
        targetLine.receivedQty = (targetLine.receivedQty || 0) + dockItem.acceptedQty;
        if (targetLine.receivedQty < targetLine.orderedQty) {
          allReceived = false;
        }
      }

      // Atomically update WarehouseInventory
      if (dockItem.acceptedQty > 0) {
        await this.inventoryModel.findOneAndUpdate(
          { warehouseId: po.destinationWarehouseId, sku: dockItem.sku },
          {
            $inc: { quantity: dockItem.acceptedQty },
            $setOnInsert: {
              _id: uuidv4(),
              warehouseId: po.destinationWarehouseId,
              sku: dockItem.sku,
              reservedQuantity: 0,
              safetyStock: 10,
              binLocation: 'A-01-01',
            },
          },
          { upsert: true, new: true },
        );

        // Also increment global product inventory stock
        await this.productModel.updateOne(
          { 'variants.sku': dockItem.sku },
          { $inc: { 'inventory.totalStock': dockItem.acceptedQty } },
        );
      }
    }

    po.status = allReceived ? POStatus.RECEIVED : POStatus.PARTIALLY_RECEIVED;
    if (allReceived) {
      po.receivedAt = new Date();
    }
    await po.save();

    // Create Receiving Receipt
    const receipt = new this.dockModel({
      _id: uuidv4(),
      receiptNumber,
      poId: po._id,
      poNumber: po.poNumber,
      supplierName: po.supplierName,
      warehouseId: po.destinationWarehouseId,
      warehouseName: po.destinationWarehouseName,
      dockBay: dto.dockBay || 'Bay 1 - Inbound Freight',
      inspectorName: dto.inspectorName || inspector,
      items: dto.items,
      passedInspection: dto.passedInspection ?? true,
      notes: dto.notes || '',
      receivedAt: new Date(),
    });

    await receipt.save();

    return {
      success: true,
      receiptNumber,
      poStatus: po.status,
      receipt,
      po,
    };
  }

  async findAllDockReceipts() {
    return this.dockModel.find().sort({ receivedAt: -1 });
  }
}
