import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public errors?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = fields;
  }
}

export function errorMiddleware(
  error: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    const response: Record<string, unknown> = {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    };

    if (error.errors) {
      response.errors = error.errors;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  console.error('Unexpected error:', error);

  res.status(500).json({
    statusCode: 500,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
}

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({
    statusCode: 404,
    message: 'Route not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
