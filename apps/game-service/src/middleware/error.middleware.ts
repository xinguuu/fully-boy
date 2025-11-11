import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  errors?: unknown;
}

export function errorMiddleware(
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  const response: Record<string, unknown> = {
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };

  if (error.errors) {
    response.errors = error.errors;
  }

  res.status(statusCode).json(response);
}

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({
    statusCode: 404,
    message: 'Route not found',
    timestamp: new Date().toISOString(),
  });
}
