import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Unexpected errors: log the full stack server-side, never expose internals to clients
    if (!(exception instanceof HttpException)) {
      this.logger.error(`[${request.method}] ${request.url}`, (exception as Error)?.stack ?? String(exception));
    }

    const body = typeof errorResponse === 'object' && errorResponse !== null
      ? (errorResponse as Record<string, unknown>)
      : { message: errorResponse };
    const { message, error: _error, statusCode: _statusCode, ...extra } = body;

    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Error: ${JSON.stringify(message)}`
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      ...extra,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
