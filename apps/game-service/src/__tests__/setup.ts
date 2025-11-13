import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db?schema=public';
  process.env.REDIS_URL = 'redis://localhost:6379';
});

afterAll(() => {
  vi.clearAllMocks();
});
