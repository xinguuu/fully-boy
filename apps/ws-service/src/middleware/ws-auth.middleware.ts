import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { AuthenticatedUser } from '@xingu/shared';

export interface AuthenticatedSocket extends Socket {
  user?: AuthenticatedUser;
}

export const wsAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      (socket.handshake.query?.token as string);

    if (!token) {
      socket.user = undefined;
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET || 'xingu-secret-key-change-in-production';

    const decoded = jwt.verify(token, jwtSecret) as AuthenticatedUser;

    socket.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('WebSocket JWT verification failed:', error);
    socket.user = undefined;
    next();
  }
};

export const requireAuth = (socket: AuthenticatedSocket): boolean => {
  if (!socket.user) {
    socket.emit('error', {
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
    return false;
  }
  return true;
};
