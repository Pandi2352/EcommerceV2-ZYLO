import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from './token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshSession, RefreshSessionSchema } from './schemas/refresh-session.schema';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: RefreshSession.name, schema: RefreshSessionSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Secrets and lifetimes are passed per call by TokenService
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
