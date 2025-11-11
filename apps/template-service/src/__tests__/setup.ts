import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  vi.mock('../config/redis', () => ({
    redis: {
      get: vi.fn(),
      setex: vi.fn(),
      del: vi.fn(),
      keys: vi.fn(),
    },
    disconnectRedis: vi.fn(),
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});
