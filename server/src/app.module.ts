import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { mongooseAsyncConfig } from './config/database.config';
import { authConfig } from './config/auth.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
      load: [authConfig],
    }),
    MongooseModule.forRootAsync(mongooseAsyncConfig),
    // Default: 100 requests per minute per IP; auth routes override with stricter limits
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    HealthModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    // Guards run in registration order: rate limit → authenticate → authorize.
    // Every route requires a valid JWT unless marked with @Public().
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
