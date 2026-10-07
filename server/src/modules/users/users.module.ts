import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { UsersService } from './users.service';
import { CustomerAccountController } from './customer-account.controller';
import { AdminCustomersController } from './admin-customers.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [CustomerAccountController, AdminCustomersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
