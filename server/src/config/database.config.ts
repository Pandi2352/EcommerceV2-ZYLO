import { MongooseModuleAsyncOptions, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const mongooseAsyncConfig: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<MongooseModuleOptions> => {
    const uri = configService.get<string>(
      'MONGO_URI',
      'mongodb://127.0.0.1:27017/zylo',
    );
    return {
      uri,
    };
  },
};
