import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { authConfig } from '../../../config/auth.config';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Primary: Extract from secure HttpOnly cookie
        (request: Request) => {
          return request?.cookies?.[authConfig.cookies.accessTokenName] || null;
        },
        // 2. Fallback: Extract from Authorization: Bearer <token> (for Swagger UI testing)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwt.accessSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserDocument> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User session is invalid or account is deactivated');
    }
    return user;
  }
}
