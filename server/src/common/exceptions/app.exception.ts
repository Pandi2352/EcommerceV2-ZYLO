import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes';

/**
 * HttpException carrying a machine-readable `code` (and optional extra fields)
 * that HttpExceptionFilter copies into the error envelope.
 */
export class AppException extends HttpException {
  constructor(
    status: HttpStatus,
    readonly code: ErrorCode,
    message: string,
    extra: Record<string, unknown> = {},
  ) {
    super({ message, code, ...extra }, status);
  }
}
