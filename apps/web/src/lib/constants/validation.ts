/**
 * Input Validation Constants
 *
 * Character limits and validation rules for all user input fields.
 */

/**
 * Input Field Character Limits
 */
export const INPUT_LIMITS = {
  /**
   * PIN input length (6 digits)
   * @example "123456"
   */
  PIN: 6,

  /**
   * Participant nickname max length (20 characters)
   */
  NICKNAME: 20,

  /**
   * Game title max length (100 characters)
   */
  GAME_TITLE: 100,

  /**
   * Game description max length (500 characters)
   */
  GAME_DESCRIPTION: 500,

  /**
   * Question content max length (500 characters)
   */
  QUESTION_CONTENT: 500,

  /**
   * Question option max length (200 characters)
   */
  QUESTION_OPTION: 200,

  /**
   * Short answer max length (100 characters)
   */
  SHORT_ANSWER: 100,

  /**
   * Tag name max length (30 characters)
   */
  TAG_NAME: 30,
} as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  /**
   * Email regex pattern
   */
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /**
   * PIN pattern (6 digits only)
   */
  PIN_PATTERN: /^\d{6}$/,

  /**
   * Password minimum length
   */
  PASSWORD_MIN_LENGTH: 8,

  /**
   * Password maximum length
   */
  PASSWORD_MAX_LENGTH: 100,
} as const;
