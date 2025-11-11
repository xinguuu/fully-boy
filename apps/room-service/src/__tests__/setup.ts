import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  vi.mock('../config/database', () => ({
    prisma: {
      room: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      game: {
        findUnique: vi.fn(),
      },
    },
    connectDatabase: vi.fn(),
    disconnectDatabase: vi.fn(),
  }));

  vi.mock('../config/redis', () => ({
    redis: {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      lpush: vi.fn(),
      lrange: vi.fn(),
      expire: vi.fn(),
      exists: vi.fn(),
    },
    disconnectRedis: vi.fn(),
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});
