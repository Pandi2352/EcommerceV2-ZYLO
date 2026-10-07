import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { CustomerAccountController } from './customer-account.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [CustomerAccountController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
