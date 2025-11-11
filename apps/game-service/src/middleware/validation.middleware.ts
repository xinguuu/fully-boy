import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          statusCode: 400,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      res.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
      });
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          statusCode: 400,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      res.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
      });
    }
  };
}
