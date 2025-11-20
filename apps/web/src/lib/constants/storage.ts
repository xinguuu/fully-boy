/**
 * LocalStorage Key Constants
 *
 * Centralized storage key patterns for browser localStorage.
 * This ensures consistency and prevents typos across the frontend.
 */

/**
 * Storage Keys
 *
 * Use these constants for all localStorage operations.
 */
export const STORAGE_KEYS = {
  /**
   * JWT access token
   * @example "access_token"
   */
  ACCESS_TOKEN: 'access_token',

  /**
   * JWT refresh token
   * @example "refresh_token"
   */
  REFRESH_TOKEN: 'refresh_token',

  /**
   * Room participant nickname
   * @param pin - Room PIN (6-digit number)
   * @example "room_123456_nickname"
   */
  ROOM_NICKNAME: (pin: string) => `room_${pin}_nickname`,

  /**
   * Room participant ID
   * @param pin - Room PIN (6-digit number)
   * @example "room_123456_participantId"
   */
  ROOM_PARTICIPANT_ID: (pin: string) => `room_${pin}_participantId`,

  /**
   * Room organizer flag (to detect reconnection)
   * @param pin - Room PIN (6-digit number)
   * @example "room_123456_isOrganizer"
   */
  ROOM_IS_ORGANIZER: (pin: string) => `room_${pin}_isOrganizer`,
} as const;

/**
 * Clear all room-specific data from localStorage
 * @param pin - Room PIN to clear data for
 */
export function clearRoomStorage(pin: string): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.ROOM_NICKNAME(pin));
  localStorage.removeItem(STORAGE_KEYS.ROOM_PARTICIPANT_ID(pin));
  localStorage.removeItem(STORAGE_KEYS.ROOM_IS_ORGANIZER(pin));
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Check if user is authenticated (has access token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}
