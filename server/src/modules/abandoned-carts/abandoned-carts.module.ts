import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AbandonedCart, AbandonedCartSchema } from './schemas/abandoned-cart.schema';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { MailModule } from '../mail/mail.module';
import { AbandonedCartsService } from './abandoned-carts.service';
import { AbandonedCartsController } from './abandoned-carts.controller';
import { AbandonedCartsSeedService } from './abandoned-carts-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AbandonedCart.name, schema: AbandonedCartSchema },
      { name: Cart.name, schema: CartSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    MailModule,
  ],
  controllers: [AbandonedCartsController],
  providers: [AbandonedCartsService, AbandonedCartsSeedService],
  exports: [AbandonedCartsService],
})
export class AbandonedCartsModule {}
