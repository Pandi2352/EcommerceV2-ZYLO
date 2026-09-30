import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export function extractRequestMeta(request: Request): RequestMeta {
  return {
    ip: request.ip,
    userAgent: request.get('user-agent')?.slice(0, 512),
  };
}

/** Injects the caller's IP address and user agent (for audit logging). */
export const ReqMeta = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestMeta =>
    extractRequestMeta(ctx.switchToHttp().getRequest<Request>()),
);
