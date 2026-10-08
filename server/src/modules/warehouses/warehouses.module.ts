import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Warehouse, WarehouseSchema } from './schemas/warehouse.schema';
import { StockTransfer, StockTransferSchema } from './schemas/stock-transfer.schema';
import { WarehouseInventory, WarehouseInventorySchema } from './schemas/warehouse-inventory.schema';
import { WarehousesService } from './warehouses.service';
import { WarehousesSeedService } from './warehouses-seed.service';
import { WarehousesController, StockTransfersController } from './warehouses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Warehouse.name, schema: WarehouseSchema },
      { name: StockTransfer.name, schema: StockTransferSchema },
      { name: WarehouseInventory.name, schema: WarehouseInventorySchema },
    ]),
  ],
  controllers: [WarehousesController, StockTransfersController],
  providers: [WarehousesService, WarehousesSeedService],
  exports: [WarehousesService],
})
export class WarehousesModule {}
