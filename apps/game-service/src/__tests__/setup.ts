import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  vi.mock('../config/database', () => ({
    prisma: {
      game: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      question: {
        deleteMany: vi.fn(),
      },
    },
    connectDatabase: vi.fn(),
    disconnectDatabase: vi.fn(),
  }));

  vi.mock('../config/redis', () => ({
    redis: {
      get: vi.fn(),
      setex: vi.fn(),
      del: vi.fn(),
    },
    disconnectRedis: vi.fn(),
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});
