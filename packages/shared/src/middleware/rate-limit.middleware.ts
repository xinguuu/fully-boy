import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../constants';

export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.AUTH_ENDPOINTS,
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.API_ENDPOINTS,
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.WS_CONNECTIONS,
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many connection attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
