import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        statusCode: 401,
        message: 'Authorization token required',
      });
      return;
    }

    const token = authHeader.substring(7);

    const userDataJson = await redis.get(`session:${token}`);

    if (!userDataJson) {
      res.status(401).json({
        statusCode: 401,
        message: 'Invalid or expired token',
      });
      return;
    }

    const userData = JSON.parse(userDataJson) as AuthUser;
    req.user = userData;

    next();
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
