/**
 * Game Type Plugin System
 *
 * Extensible plugin architecture for adding new game types
 * without modifying core game logic.
 *
 * Supports two categories:
 * - QUIZ: Question-based games (use Question model)
 * - PARTY: Session-based games (use session state)
 */

/**
 * Plugin category
 */
export enum PluginCategory {
  QUIZ = 'quiz',
  PARTY = 'party',
}

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
 * Player state in session (for party games)
 */
export interface PlayerState {
  id: string;
  nickname: string;
  role?: string; // e.g., 'liar', 'mafia', 'citizen'
  status: 'active' | 'eliminated' | 'spectator';
  data?: Record<string, unknown>; // Player-specific data
}

/**
 * Session state for party games
 */
export interface SessionState {
  round: number;
  phase: string; // e.g., 'discussion', 'voting', 'reveal'
  players: PlayerState[];
  data: Record<string, unknown>; // Game-specific data
}

/**
 * Game action (player input for party games)
 */
export interface GameAction {
  type: string; // e.g., 'vote', 'answer', 'role-action'
  playerId: string;
  payload: unknown;
  timestamp?: Date;
}

/**
 * Base Game Type Plugin Interface
 *
 * Every game type must implement this interface to be registered
 * in the GameTypeRegistry.
 *
 * Supports two categories:
 * - QUIZ (PluginCategory.QUIZ): Question-based games
 *   Required: checkAnswer, calculateScore, validateQuestionData, getDefaultQuestionData
 * - PARTY (PluginCategory.PARTY): Session-based games
 *   Required: validateSessionSettings, getDefaultSessionSettings, initializeSession, processAction
 */
export interface GameTypePlugin {
  /**
   * Unique identifier for this game type
   * @example 'multiple-choice', 'true-false', 'liar-game', 'mafia-game'
   */
  readonly type: string;

  /**
   * Human-readable name
   * @example 'Multiple Choice', 'True/False', 'Liar Game', 'Mafia Game'
   */
  readonly name: string;

  /**
   * Plugin category (QUIZ or PARTY)
   */
  readonly category: PluginCategory;

  // ==========================================
  // QUIZ GAMES (Question-based) - Required for PluginCategory.QUIZ
  // ==========================================

  /**
   * Check if user's answer is correct (QUIZ games only)
   *
   * @param questionData - Question configuration (from Question.data)
   * @param userAnswer - User's submitted answer
   * @returns true if answer is correct, false otherwise
   */
  checkAnswer?(questionData: QuestionData, userAnswer: unknown): boolean;

  /**
   * Calculate score based on correctness and response time (QUIZ games only)
   *
   * @param options - Score calculation options
   * @returns Score result with breakdown
   */
  calculateScore?(options: ScoreCalculationOptions): ScoreResult;

  /**
   * Validate question data structure (QUIZ games only)
   *
   * @param questionData - Question data to validate
   * @returns true if valid, false otherwise
   */
  validateQuestionData?(questionData: unknown): questionData is QuestionData;

  /**
   * Get default question data template (QUIZ games only)
   * Useful for question editor UI
   */
  getDefaultQuestionData?(): QuestionData;

  // ==========================================
  // PARTY GAMES (Session-based) - Required for PluginCategory.PARTY
  // ==========================================

  /**
   * Validate session settings (PARTY games only)
   *
   * @param settings - Session settings to validate
   * @returns true if valid, false otherwise
   */
  validateSessionSettings?(settings: unknown): boolean;

  /**
   * Get default session settings (PARTY games only)
   * Useful for settings UI
   */
  getDefaultSessionSettings?(): Record<string, unknown>;

  /**
   * Initialize session state (PARTY games only)
   *
   * @param settings - Session settings
   * @param players - Initial player list
   * @returns Initial session state
   */
  initializeSession?(
    settings: Record<string, unknown>,
    players: Array<{ id: string; nickname: string }>,
  ): SessionState;

  /**
   * Process player action and update session state (PARTY games only)
   *
   * @param session - Current session state
   * @param action - Player action
   * @returns Updated session state
   */
  processAction?(session: SessionState, action: GameAction): SessionState;
}

/**
 * Plugin metadata for UI display
 */
export interface PluginMetadata {
  type: string;
  name: string;
  description: string;
  category: PluginCategory; // QUIZ or PARTY
  icon?: string;
  templateCategory?: string; // e.g., 'K-POP', 'Variety Show', 'Icebreaker'
  needsMobile?: boolean;
  minPlayers?: number;
  maxPlayers?: number;
  estimatedDuration?: number; // in minutes
}
