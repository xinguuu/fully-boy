/**
 * Game Configuration Constants
 *
 * All game-related timing, limits, and configuration values.
 */

/**
 * Game UI Timing (in milliseconds)
 *
 * Controls the duration of various UI states during gameplay.
 */
export const GAME_UI_TIMING = {
  /**
   * Question intro screen duration (2 seconds)
   * Shows "Question 1/3" before displaying the actual question
   */
  QUESTION_INTRO_MS: 2000,

  /**
   * Answer reveal screen duration (3 seconds)
   * Shows correct answer and whether participant was right/wrong
   */
  ANSWER_REVEAL_MS: 3000,

  /**
   * Leaderboard transition duration (3 seconds)
   * Time before showing leaderboard after answer reveal
   */
  LEADERBOARD_TRANSITION_MS: 3000,

  /**
   * Score animation display duration (3 seconds)
   * Shows "+500" score animation
   */
  SCORE_ANIMATION_MS: 3000,

  /**
   * Next question countdown duration (5 seconds)
   * Countdown before starting next question
   */
  NEXT_QUESTION_COUNTDOWN_MS: 5000,

  /**
   * Copy notification duration (2 seconds)
   * Shows "Copied!" message after copying PIN
   */
  COPY_NOTIFICATION_MS: 2000,
} as const;

/**
 * Timer Color Thresholds (percentage)
 *
 * Determines when timer changes color based on remaining time percentage.
 */
export const TIMER_THRESHOLDS = {
  /**
   * Warning threshold (30%)
   * Timer turns yellow when <= 30% time remaining
   */
  WARNING_PERCENT: 30,

  /**
   * Danger threshold (10%)
   * Timer turns red when <= 10% time remaining
   */
  DANGER_PERCENT: 10,
} as const;

/**
 * Game Settings
 *
 * Default values and limits for game configuration.
 */
export const GAME_SETTINGS = {
  /**
   * Default question duration (30 seconds)
   * Used when question doesn't specify a duration
   */
  DEFAULT_QUESTION_DURATION_SEC: 30,

  /**
   * Default game duration (10 minutes)
   * Estimated total game time for display purposes
   */
  DEFAULT_GAME_DURATION_MIN: 10,

  /**
   * Default max players (30)
   * Maximum number of participants allowed in a room
   */
  DEFAULT_MAX_PLAYERS: 30,

  /**
   * Available time limit options for questions (in seconds)
   */
  TIME_LIMIT_OPTIONS: [10, 20, 30, 45, 60, 90] as const,
} as const;

/**
 * Leaderboard Configuration
 */
export const LEADERBOARD_CONFIG = {
  /**
   * Maximum entries to show in final leaderboard (10)
   */
  FINAL_MAX_ENTRIES: 10,

  /**
   * Top players to show during live game (5)
   * Shows "TOP 5" during gameplay
   */
  LIVE_TOP_ENTRIES: 5,
} as const;

/**
 * Question Configuration
 */
export const QUESTION_CONFIG = {
  /**
   * Default number of multiple-choice options (4)
   */
  DEFAULT_OPTION_COUNT: 4,

  /**
   * Minimum number of multiple-choice options (2)
   */
  MIN_OPTION_COUNT: 2,

  /**
   * Maximum number of multiple-choice options (6)
   */
  MAX_OPTION_COUNT: 6,

  /**
   * Question preview character limit (60 chars)
   * Used in question list display
   */
  PREVIEW_LENGTH: 60,
} as const;

/**
 * PIN Configuration
 */
export const PIN_CONFIG = {
  /**
   * PIN length (6 digits)
   */
  LENGTH: 6,

  /**
   * PIN minimum value (100000)
   */
  MIN: 100000,

  /**
   * PIN maximum value (999999)
   */
  MAX: 999999,
} as const;
