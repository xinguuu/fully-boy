/**
 * Game Type Plugin System
 *
 * Extensible plugin architecture for adding new game types
 * without modifying core game logic.
 */

/**
 * Score calculation options
 */
export interface ScoreCalculationOptions {
  isCorrect: boolean;
  responseTimeMs: number;
  questionDuration: number; // in seconds
  basePoints?: number;
  speedBonusMultiplier?: number;
}

/**
 * Score calculation result
 */
export interface ScoreResult {
  points: number;
  isCorrect: boolean;
  responseTimeMs: number;
  breakdown: {
    basePoints: number;
    speedBonus: number;
    totalPoints: number;
  };
}

/**
 * Question data structure (flexible JSON)
 */
export interface QuestionData {
  type: string;
  duration?: number;
  [key: string]: unknown;
}

/**
 * Base Game Type Plugin Interface
 *
 * Every game type must implement this interface to be registered
 * in the GameTypeRegistry.
 */
export interface GameTypePlugin {
  /**
   * Unique identifier for this game type
   * @example 'multiple-choice', 'true-false', 'survival-choice'
   */
  readonly type: string;

  /**
   * Human-readable name
   * @example 'Multiple Choice', 'True/False', 'Survival Choice'
   */
  readonly name: string;

  /**
   * Check if user's answer is correct
   *
   * @param questionData - Question configuration (from Question.data)
   * @param userAnswer - User's submitted answer
   * @returns true if answer is correct, false otherwise
   */
  checkAnswer(questionData: QuestionData, userAnswer: unknown): boolean;

  /**
   * Calculate score based on correctness and response time
   *
   * @param options - Score calculation options
   * @returns Score result with breakdown
   */
  calculateScore(options: ScoreCalculationOptions): ScoreResult;

  /**
   * Validate question data structure
   *
   * @param questionData - Question data to validate
   * @returns true if valid, false otherwise
   */
  validateQuestionData(questionData: unknown): questionData is QuestionData;

  /**
   * Get default question data template
   * Useful for question editor UI
   */
  getDefaultQuestionData(): QuestionData;
}

/**
 * Plugin metadata for UI display
 */
export interface PluginMetadata {
  type: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  needsMobile?: boolean;
  minPlayers?: number;
  maxPlayers?: number;
  estimatedDuration?: number; // in minutes
}
