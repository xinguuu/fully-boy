export * from './types';
export * from './constants';
export * from './utils';
export * from './errors';
export * from './schemas';

// Export plugin system
export * from './plugins/registry';
export * from './plugins/base-plugin';
export * from './plugins/game-types';

// Export only types from middleware (safe for frontend)
export type { AuthenticatedUser } from './middleware/auth.middleware';

// NOTE: Logger is NOT exported here to prevent Winston (Node.js) from being bundled in frontend
// Backend services should import directly: import { logger } from '@xingu/shared/logger'
// Frontend should use its own logger: import { logger } from '@/lib/logger'
