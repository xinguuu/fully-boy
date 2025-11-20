/**
 * Frontend Configuration Constants
 *
 * API URLs, React Query settings, and other frontend configuration.
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  /**
   * Base API URL fallback (development)
   * Uses NEXT_PUBLIC_API_URL from env or localhost
   */
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
} as const;

/**
 * React Query Configuration
 *
 * Default settings for React Query (TanStack Query).
 */
export const QUERY_CONFIG = {
  /**
   * Stale time (60 seconds)
   * How long data is considered fresh before refetching
   */
  STALE_TIME_MS: 60 * 1000,

  /**
   * Retry attempts (1)
   * Number of times to retry failed requests
   */
  RETRY_ATTEMPTS: 1,

  /**
   * Refetch on window focus (disabled)
   * Whether to refetch queries when window regains focus
   */
  REFETCH_ON_WINDOW_FOCUS: false,
} as const;

/**
 * WebSocket Configuration
 */
export const WS_CONFIG = {
  /**
   * Initial reconnection delay (1 second)
   * Time to wait before first reconnection attempt
   */
  RECONNECTION_DELAY_MS: 1000,

  /**
   * Maximum reconnection delay (5 seconds)
   * Maximum time to wait between reconnection attempts
   */
  RECONNECTION_DELAY_MAX_MS: 5000,

  /**
   * Maximum reconnection attempts (5)
   * Number of times to attempt reconnection before giving up
   */
  RECONNECTION_ATTEMPTS: 5,
} as const;
