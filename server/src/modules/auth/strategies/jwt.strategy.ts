import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { authConfig, AuthConfig } from '../../../config/auth.config';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants';
import { AccessTokenPayload } from '../token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    @Inject(authConfig.KEY) config: AuthConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Primary: Extract from secure HttpOnly cookie
        (request: Request) => {
          return request?.cookies?.[ACCESS_TOKEN_COOKIE] || null;
        },
        // 2. Fallback: Extract from Authorization: Bearer <token> (for Swagger UI testing)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.accessSecret,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<UserDocument> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User session is invalid or account is deactivated');
    }
    return user;
  }
}
