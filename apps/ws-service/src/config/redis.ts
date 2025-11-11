import Redis from 'ioredis';

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
  console.log('✅ Redis connected');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

redisPub.on('connect', () => {
  console.log('✅ Redis Pub connected');
});

redisSub.on('connect', () => {
  console.log('✅ Redis Sub connected');
});

export async function disconnectRedis() {
  await Promise.all([redis.quit(), redisPub.quit(), redisSub.quit()]);
  console.log('✅ Redis disconnected');
}
