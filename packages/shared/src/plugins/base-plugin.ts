import type {
  GameTypePlugin,
  QuestionData,
  ScoreCalculationOptions,
  ScoreResult,
  PluginCategory,
} from '../types/plugin.types';

/**
 * Base Game Type Plugin
 *
 * Abstract base class that provides common score calculation logic.
 * Subclasses only need to implement answer checking and validation.
 *
 * This base class is for QUIZ games (question-based).
 * PARTY games should implement GameTypePlugin directly.
 */
export abstract class BaseGameTypePlugin implements GameTypePlugin {
  public abstract readonly type: string;
  public abstract readonly name: string;
  public abstract readonly category: PluginCategory;

  // Default scoring constants (can be overridden)
  protected readonly DEFAULT_BASE_POINTS = 100;
  protected readonly DEFAULT_SPEED_BONUS_MULTIPLIER = 0.3;

  /**
   * Calculate score using Kahoot-style formula
   *
   * Formula:
   * - Correct answer: basePoints + speedBonus
   * - Wrong answer: 0 points
   * - Speed bonus: (remainingTime / totalTime) * basePoints * multiplier
   */
  public calculateScore(options: ScoreCalculationOptions): ScoreResult {
    const {
      isCorrect,
      responseTimeMs,
      questionDuration,
      basePoints = this.DEFAULT_BASE_POINTS,
      speedBonusMultiplier = this.DEFAULT_SPEED_BONUS_MULTIPLIER,
    } = options;

    if (!isCorrect) {
      return {
        points: 0,
        isCorrect: false,
        responseTimeMs,
        breakdown: {
          basePoints: 0,
          speedBonus: 0,
          totalPoints: 0,
        },
      };
    }

    const responseTimeSec = responseTimeMs / 1000;
    const remainingTime = Math.max(0, questionDuration - responseTimeSec);
    const timeRatio = remainingTime / questionDuration;

    const speedBonus = Math.floor(basePoints * speedBonusMultiplier * timeRatio);
    const totalPoints = basePoints + speedBonus;

    return {
      points: totalPoints,
      isCorrect: true,
      responseTimeMs,
      breakdown: {
        basePoints,
        speedBonus,
        totalPoints,
      },
    };
  }

  /**
   * Abstract method: Check if answer is correct
   * Must be implemented by subclasses
   */
  public abstract checkAnswer(questionData: QuestionData, userAnswer: unknown): boolean;

  /**
   * Abstract method: Validate question data structure
   * Must be implemented by subclasses
   */
  public abstract validateQuestionData(questionData: unknown): questionData is QuestionData;

  /**
   * Abstract method: Get default question data template
   * Must be implemented by subclasses
   */
  public abstract getDefaultQuestionData(): QuestionData;
}
