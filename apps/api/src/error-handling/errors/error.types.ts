export interface ErrorResponse {
  message: string;
  code: string;
  statusCode: number;
  traceId: string;
  timestamp: string;
  details?: unknown;
  stack?: string;
  path?: string;
}

export interface LogContext {
  traceId: string;
  userId?: string;
  sessionId?: string;
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  [key: string]: unknown;
}
