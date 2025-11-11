import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  vi.mock('../config/database', () => ({
    prisma: {
      gameResult: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      room: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
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
    },
    disconnectRedis: vi.fn(),
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});
