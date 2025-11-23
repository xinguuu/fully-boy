import Redis from 'ioredis';
import { logger } from '@xingu/shared/logger';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: 0,
});

export const redisPub = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: 0,
});

export const redisSub = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: 0,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (error) => {
  logger.error('Redis connection error', { error });
});

redisPub.on('connect', () => {
  logger.info('Redis Pub connected');
});

redisSub.on('connect', () => {
  logger.info('Redis Sub connected');
});

export async function disconnectRedis() {
  await Promise.all([redis.quit(), redisPub.quit(), redisSub.quit()]);
  logger.info('Redis disconnected');
}
