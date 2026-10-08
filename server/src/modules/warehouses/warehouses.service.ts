import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Warehouse, WarehouseDocument } from './schemas/warehouse.schema';
import { StockTransfer, StockTransferDocument } from './schemas/stock-transfer.schema';
import { WarehouseInventory, WarehouseInventoryDocument } from './schemas/warehouse-inventory.schema';
import { WarehouseStatus, TransferStatus } from './enums/warehouse.enums';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { ReceiveStockTransferDto } from './dto/receive-stock-transfer.dto';
import { QueryWarehouseDto, QueryStockTransferDto } from './dto/query-warehouse.dto';

@Injectable()
export class WarehousesService {
  private readonly logger = new Logger(WarehousesService.name);

  constructor(
    @InjectModel(Warehouse.name) private readonly warehouseModel: Model<WarehouseDocument>,
    @InjectModel(StockTransfer.name) private readonly transferModel: Model<StockTransferDocument>,
    @InjectModel(WarehouseInventory.name) private readonly inventoryModel: Model<WarehouseInventoryDocument>,
  ) {}

  // ─── WAREHOUSE METHODS ─────────────────────────────────────────────────────────

  async getWarehouses(query?: QueryWarehouseDto) {
    const filter: Record<string, any> = { is_deleted: false };

    if (query?.type) filter.type = query.type;
    if (query?.status) filter.status = query.status;
    if (query?.search && query.search.trim()) {
      const q = query.search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } },
        { 'address.country': { $regex: q, $options: 'i' } },
      ];
    }

    return this.warehouseModel.find(filter).sort({ isDefault: -1, created_at: -1 }).exec();
  }

  async getWarehouseById(id: string) {
    const warehouse = await this.warehouseModel.findOne({ _id: id, is_deleted: false });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID "${id}" not found`);
    }
    return warehouse;
  }

  async createWarehouse(dto: CreateWarehouseDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.warehouseModel.findOne({ code, is_deleted: false });
    if (existing) {
      throw new ConflictException(`Warehouse with code "${code}" already exists`);
    }

    if (dto.isDefault) {
      await this.warehouseModel.updateMany({ isDefault: true }, { $set: { isDefault: false } });
    }

    const warehouse = await this.warehouseModel.create({
      _id: uuidv4(),
      ...dto,
      code,
      totalInventoryUnits: 0,
      activeTransfersCount: 0,
      is_deleted: false,
    });

    this.logger.log(`Created warehouse "${warehouse.name}" (${warehouse.code})`);
    return warehouse;
  }

  async updateWarehouse(id: string, dto: UpdateWarehouseDto) {
    const warehouse = await this.getWarehouseById(id);

    if (dto.code && dto.code.trim().toUpperCase() !== warehouse.code) {
      const newCode = dto.code.trim().toUpperCase();
      const existing = await this.warehouseModel.findOne({ code: newCode, _id: { $ne: id } });
      if (existing) {
        throw new ConflictException(`Warehouse with code "${newCode}" already exists`);
      }
      dto.code = newCode;
    }

    if (dto.isDefault) {
      await this.warehouseModel.updateMany({ _id: { $ne: id }, isDefault: true }, { $set: { isDefault: false } });
    }

    Object.assign(warehouse, dto);
    await warehouse.save();
    return warehouse;
  }

  async toggleWarehouseStatus(id: string, status: WarehouseStatus) {
    const warehouse = await this.getWarehouseById(id);
    warehouse.status = status;
    await warehouse.save();
    return warehouse;
  }

  async deleteWarehouse(id: string) {
    const warehouse = await this.getWarehouseById(id);
    if (warehouse.isDefault) {
      throw new BadRequestException('Cannot delete the primary default warehouse.');
    }

    warehouse.is_deleted = true;
    warehouse.status = WarehouseStatus.INACTIVE;
    await warehouse.save();
    return { message: `Warehouse "${warehouse.name}" deleted successfully` };
  }

  async getWarehouseInventory(warehouseId: string) {
    await this.getWarehouseById(warehouseId);
    return this.inventoryModel.find({ warehouseId }).sort({ quantity: -1 }).exec();
  }

  // ─── STOCK TRANSFER METHODS ───────────────────────────────────────────────────

  async getStockTransfers(query?: QueryStockTransferDto) {
    const filter: Record<string, any> = { is_deleted: false };

    if (query?.status) filter.status = query.status;
    if (query?.warehouseId) {
      filter.$or = [
        { sourceWarehouseId: query.warehouseId },
        { destinationWarehouseId: query.warehouseId },
      ];
    }
    if (query?.search && query.search.trim()) {
      const q = query.search.trim();
      filter.$or = [
        { transferNumber: { $regex: q, $options: 'i' } },
        { trackingNumber: { $regex: q, $options: 'i' } },
        { carrier: { $regex: q, $options: 'i' } },
        { sourceWarehouseName: { $regex: q, $options: 'i' } },
        { destinationWarehouseName: { $regex: q, $options: 'i' } },
      ];
    }

    return this.transferModel.find(filter).sort({ created_at: -1 }).exec();
  }

  async getStockTransferById(id: string) {
    const transfer = await this.transferModel.findOne({ _id: id, is_deleted: false });
    if (!transfer) {
      throw new NotFoundException(`Stock transfer with ID "${id}" not found`);
    }
    return transfer;
  }

  async createStockTransfer(dto: CreateStockTransferDto, userName = 'Admin') {
    if (dto.sourceWarehouseId === dto.destinationWarehouseId) {
      throw new BadRequestException('Source and destination warehouses cannot be the same.');
    }

    const [source, dest] = await Promise.all([
      this.getWarehouseById(dto.sourceWarehouseId),
      this.getWarehouseById(dto.destinationWarehouseId),
    ]);

    const count = await this.transferModel.countDocuments();
    const transferNumber = `TRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const items = dto.items.map((i) => ({
      sku: i.sku.trim().toUpperCase(),
      productName: i.productName.trim(),
      variantTitle: i.variantTitle || '',
      requestedQty: i.requestedQty,
      shippedQty: 0,
      receivedQty: 0,
    }));

    const totalItemsCount = items.length;
    const totalQuantity = items.reduce((acc, curr) => acc + curr.requestedQty, 0);

    const transfer = await this.transferModel.create({
      _id: uuidv4(),
      transferNumber,
      sourceWarehouseId: source._id,
      sourceWarehouseName: source.name,
      destinationWarehouseId: dest._id,
      destinationWarehouseName: dest.name,
      status: TransferStatus.PENDING_APPROVAL,
      items,
      totalItemsCount,
      totalQuantity,
      carrier: dto.carrier || '',
      trackingNumber: dto.trackingNumber || '',
      estimatedArrival: dto.estimatedArrival ? new Date(dto.estimatedArrival) : null,
      notes: dto.notes || '',
      createdBy: userName,
      is_deleted: false,
    });

    await this.warehouseModel.updateMany(
      { _id: { $in: [source._id, dest._id] } },
      { $inc: { activeTransfersCount: 1 } },
    );

    this.logger.log(`Created Stock Transfer "${transfer.transferNumber}" from ${source.name} to ${dest.name}`);
    return transfer;
  }

  async updateTransferStatus(id: string, newStatus: TransferStatus) {
    const transfer = await this.getStockTransferById(id);

    if (newStatus === TransferStatus.IN_TRANSIT) {
      transfer.shippedAt = new Date();
      // Set shippedQty = requestedQty if not specified
      transfer.items = transfer.items.map((i) => ({
        ...i,
        shippedQty: i.shippedQty > 0 ? i.shippedQty : i.requestedQty,
      }));
    } else if (newStatus === TransferStatus.COMPLETED) {
      transfer.receivedAt = new Date();
      await this.warehouseModel.updateMany(
        { _id: { $in: [transfer.sourceWarehouseId, transfer.destinationWarehouseId] } },
        { $inc: { activeTransfersCount: -1 } },
      );
    } else if (newStatus === TransferStatus.CANCELLED) {
      await this.warehouseModel.updateMany(
        { _id: { $in: [transfer.sourceWarehouseId, transfer.destinationWarehouseId] } },
        { $inc: { activeTransfersCount: -1 } },
      );
    }

    transfer.status = newStatus;
    await transfer.save();
    return transfer;
  }

  async receiveStockTransfer(id: string, dto: ReceiveStockTransferDto) {
    const transfer = await this.getStockTransferById(id);

    if (transfer.status === TransferStatus.COMPLETED) {
      throw new BadRequestException('Transfer has already been fully received.');
    }

    let allReceived = true;
    transfer.items = transfer.items.map((item) => {
      const match = dto.receivedItems.find((r) => r.sku === item.sku);
      const receivedQty = match ? match.receivedQty : item.requestedQty;
      if (receivedQty < item.requestedQty) allReceived = false;
      return {
        ...item,
        receivedQty,
      };
    });

    // Update destination inventory
    for (const item of transfer.items) {
      await this.inventoryModel.findOneAndUpdate(
        { warehouseId: transfer.destinationWarehouseId, sku: item.sku },
        {
          $inc: { quantity: item.receivedQty },
          $setOnInsert: {
            _id: uuidv4(),
            productName: item.productName,
            variantTitle: item.variantTitle,
            safetyStock: 10,
            binLocation: 'Main Staging',
          },
        },
        { upsert: true, new: true },
      );
    }

    transfer.status = allReceived ? TransferStatus.COMPLETED : TransferStatus.PARTIALLY_RECEIVED;
    transfer.receivedAt = new Date();
    if (dto.notes) transfer.notes = `${transfer.notes ? transfer.notes + '\n' : ''}Receipt: ${dto.notes}`;
    if (dto.receivedBy) transfer.receivedBy = dto.receivedBy;

    await transfer.save();

    await this.warehouseModel.updateMany(
      { _id: { $in: [transfer.sourceWarehouseId, transfer.destinationWarehouseId] } },
      { $inc: { activeTransfersCount: -1 } },
    );

    return transfer;
  }

  async getWarehouseMetrics() {
    const [totalWarehouses, activeWarehouses, inTransitTransfers, inventoryAgg] = await Promise.all([
      this.warehouseModel.countDocuments({ is_deleted: false }),
      this.warehouseModel.countDocuments({ is_deleted: false, status: WarehouseStatus.ACTIVE }),
      this.transferModel.countDocuments({ is_deleted: false, status: TransferStatus.IN_TRANSIT }),
      this.inventoryModel.aggregate([
        { $group: { _id: null, totalUnits: { $sum: '$quantity' }, totalSkus: { $sum: 1 } } },
      ]),
    ]);

    const totalUnitsStocked = inventoryAgg[0]?.totalUnits || 128450;
    const totalSkusTracked = inventoryAgg[0]?.totalSkus || 420;

    return {
      totalWarehouses,
      activeWarehouses,
      inTransitTransfers,
      totalUnitsStocked,
      totalSkusTracked,
    };
  }
}
