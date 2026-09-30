/** Success envelope produced by the server's TransformInterceptor */
export interface ApiEnvelope<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
}

/** Error envelope produced by the server's HttpExceptionFilter */
export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];
  code?: string;
  retryAfterSeconds?: number;
  path?: string;
  timestamp?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface MessageResponse {
  message: string;
}
