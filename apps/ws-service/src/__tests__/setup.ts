import { beforeAll, afterAll } from 'vitest';
import { registerBuiltInPlugins } from '@xingu/shared';

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.REDIS_URL = 'redis://localhost:6379';

  // Register built-in game type plugins for testing
  registerBuiltInPlugins();
});

afterAll(() => {
  // Cleanup if needed
});
