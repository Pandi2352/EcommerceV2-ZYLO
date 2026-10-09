import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ShipmentDispatch,
  ShipmentDispatchSchema,
} from './schemas/shipment-dispatch.schema';
import {
  CarrierWebhook,
  CarrierWebhookSchema,
} from './schemas/carrier-webhook.schema';
import {
  Warehouse,
  WarehouseSchema,
} from '../warehouses/schemas/warehouse.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { ShippingDispatchService } from './shipping-dispatch.service';
import { ShippingDispatchController } from './shipping-dispatch.controller';
import { ShippingDispatchSeedService } from './shipping-dispatch-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShipmentDispatch.name, schema: ShipmentDispatchSchema },
      { name: CarrierWebhook.name, schema: CarrierWebhookSchema },
      { name: Warehouse.name, schema: WarehouseSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [ShippingDispatchController],
  providers: [ShippingDispatchService, ShippingDispatchSeedService],
  exports: [ShippingDispatchService],
})
export class ShippingDispatchModule {}
