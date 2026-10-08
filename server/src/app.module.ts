import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { AuditModule } from './modules/audit/audit.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { StaffUsersModule } from './modules/staff-users/staff-users.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { UserOverviewModule } from './modules/user-overview/user-overview.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { EmailTemplatesModule } from './modules/email-templates/email-templates.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { BundlesModule } from './modules/bundles/bundles.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AbandonedCartsModule } from './modules/abandoned-carts/abandoned-carts.module';
import { mongooseAsyncConfig } from './config/database.config';
import { appConfig } from './config/app.config';
import { authConfig } from './config/auth.config';
import { mailConfig } from './config/mail.config';
import { oauthConfig } from './config/oauth.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PasswordChangeGuard } from './common/guards/password-change.guard';
import { AccountTypeGuard } from './common/authorization/account-type.guard';
import { PermissionsGuard } from './common/authorization/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
      load: [appConfig, authConfig, mailConfig, oauthConfig],
    }),
    MongooseModule.forRootAsync(mongooseAsyncConfig),
    // Default: 100 requests per minute per IP; sensitive routes override with stricter limits
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    MailModule,
    AuditModule,
    HealthModule,
    UsersModule,
    AuthModule,
    PermissionsModule,
    RolesModule,
    StaffUsersModule,
    InvitationsModule,
    UserOverviewModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    CartModule,
    WishlistModule,
    OrdersModule,
    ReviewsModule,
    SettingsModule,
    CouponsModule,
    AnalyticsModule,
    ReturnsModule,
    PaymentsModule,
    UploadsModule,
    EmailTemplatesModule,
    WarehousesModule,
    BundlesModule,
    ScheduleModule.forRoot(),
    AbandonedCartsModule,
  ],
  providers: [
    // Guards run in registration order: rate limit → authenticate → forced password change → account type → permissions → roles.
    // Every route requires a valid JWT unless marked with @Public().
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PasswordChangeGuard },
    { provide: APP_GUARD, useClass: AccountTypeGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
