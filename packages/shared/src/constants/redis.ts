/**
 * Redis Configuration Constants
 *
 * Centralized Redis key patterns and TTL values for all services.
 * This ensures consistency across the entire application.
 */

/**
 * Redis Key Patterns
 *
 * Use these functions to generate consistent Redis keys across all services.
 */
export const REDIS_KEYS = {
  /**
   * Room state key (used by ws-service)
   * @example "room:123456:state"
   */
  ROOM_STATE: (pin: string) => `room:${pin}:state`,

  /**
   * Room participants list key (used by room-service)
   * @example "room:participants:123456"
   */
  ROOM_PARTICIPANTS: (pin: string) => `room:participants:${pin}`,

  /**
   * Participant session key (used by room-service)
   * @example "participant:session:abc123xyz"
   */
  PARTICIPANT_SESSION: (sessionId: string) => `participant:session:${sessionId}`,

  /**
   * Refresh token key (used by auth-service)
   * @example "refresh_token:user123:token456"
   */
  REFRESH_TOKEN: (userId: string, token: string) => `refresh_token:${userId}:${token}`,

  /**
   * Template cache key (used by template-service)
   * @example "template:cache:template123"
   */
  TEMPLATE_CACHE: (templateId: string) => `template:cache:${templateId}`,

  /**
   * All templates cache key (used by template-service)
   * @example "templates:all"
   */
  TEMPLATES_ALL: () => 'templates:all',
} as const;

/**
 * Redis TTL (Time To Live) values in seconds
 *
 * These values determine how long data persists in Redis before expiring.
 */
export const REDIS_TTL = {
  /**
   * Room state expiration (24 hours)
   * Used by: ws-service
   */
  ROOM_STATE: 86400, // 24 hours = 24 * 60 * 60

  /**
   * Participant session expiration (2 hours)
   * Used by: room-service
   * Reason: Participants are expected to finish games within 2 hours
   */
  PARTICIPANT_SESSION: 7200, // 2 hours = 2 * 60 * 60

  /**
   * Template cache expiration (1 hour)
   * Used by: template-service
   * Reason: Templates change infrequently, 1 hour is sufficient
   */
  TEMPLATE_CACHE: 3600, // 1 hour = 60 * 60

  /**
   * Refresh token expiration (7 days)
   * Used by: auth-service
   * Reason: Users should re-authenticate after 1 week for security
   */
  REFRESH_TOKEN: 604800, // 7 days = 7 * 24 * 60 * 60

  /**
   * Default room expiration (2 hours)
   * Used by: room-service
   * Reason: Rooms expire 2 hours after creation by default
   */
  DEFAULT_ROOM_EXPIRATION_MINUTES: 120, // 2 hours

  /**
   * Maximum room expiration (8 hours)
   * Used by: room-service
   * Reason: No room should exist longer than 8 hours
   */
  MAX_ROOM_EXPIRATION_MINUTES: 480, // 8 hours
} as const;

/**
 * Database Configuration
 */
export const DB_CONFIG = {
  /**
   * Database connection retry delay (5 seconds)
   * Used by: all services using PrismaService
   */
  RETRY_DELAY_MS: 5000,

  /**
   * Maximum database connection retry attempts
   * Used by: all services using PrismaService
   */
  MAX_RETRIES: 3,
} as const;
