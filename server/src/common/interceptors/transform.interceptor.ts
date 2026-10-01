import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponseEnvelope<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponseEnvelope<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(
      map((result) => {
        // If the controller handler already returned an envelope with { success, data }, prevent double-wrapping
        if (result && typeof result === 'object' && 'data' in result && 'success' in result) {
          const envelope = result as Record<string, any>;
          return {
            success: envelope.success ?? true,
            statusCode: envelope.statusCode || statusCode,
            data: envelope.data,
            timestamp: envelope.timestamp || new Date().toISOString(),
            ...(envelope.message ? { message: envelope.message } : {}),
            ...(envelope.meta ? { meta: envelope.meta } : {}),
            ...(envelope.diff ? { diff: envelope.diff } : {}),
          };
        }
        return {
          success: true,
          statusCode,
          data: result,
          timestamp: new Date().toISOString(),
        };
      })
    );
  }
}
