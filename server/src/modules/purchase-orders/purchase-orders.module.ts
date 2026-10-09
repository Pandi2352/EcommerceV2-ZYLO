import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import {
  PurchaseOrder,
  PurchaseOrderSchema,
} from './schemas/purchase-order.schema';
import {
  ReceivingDock,
  ReceivingDockSchema,
} from './schemas/receiving-dock.schema';
import {
  Warehouse,
  WarehouseSchema,
} from '../warehouses/schemas/warehouse.schema';
import {
  WarehouseInventory,
  WarehouseInventorySchema,
} from '../warehouses/schemas/warehouse-inventory.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersSeedService } from './purchase-orders-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
      { name: ReceivingDock.name, schema: ReceivingDockSchema },
      { name: Warehouse.name, schema: WarehouseSchema },
      { name: WarehouseInventory.name, schema: WarehouseInventorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService, PurchaseOrdersSeedService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
