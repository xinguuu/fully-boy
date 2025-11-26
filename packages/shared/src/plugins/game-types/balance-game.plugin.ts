import { BaseGameTypePlugin } from '../base-plugin';
import type { QuestionData, ScoreCalculationOptions } from '../../types/plugin.types';
import { PluginCategory } from '../../types/plugin.types';

/**
 * Balance Game Question Data
 *
 * A voting-style game where players choose between two options.
 * No correct answer - results show vote distribution.
 */
export interface BalanceQuestionData extends QuestionData {
  type: 'balance-game';
  optionA: string;
  optionB: string;
  imageA?: string; // Optional image for option A
  imageB?: string; // Optional image for option B
  explanation?: string; // Optional explanation after voting
  duration?: number; // Time limit in seconds (default: 15)
  scoringMode?: 'majority' | 'none'; // majority = points for majority vote, none = no points
}

/**
 * Balance Game Plugin
 *
 * A vs B voting game where players choose between two options.
 * Shows vote distribution after all players have voted.
 *
 * Scoring modes:
 * - 'none': No points awarded (pure voting/discussion)
 * - 'majority': Points awarded to players who voted with the majority
 */
export class BalanceGamePlugin extends BaseGameTypePlugin {
  public readonly type = 'balance-game';
  public readonly name = '밸런스 게임';
  public readonly category = PluginCategory.QUIZ;

  /**
   * Check if user's answer is valid (always true for balance game)
   *
   * For balance game, any valid choice (A or B) is accepted.
   * The "correctness" is determined by majority vote after all answers are collected.
   */
  public checkAnswer(questionData: QuestionData, userAnswer: unknown): boolean {
    if (!this.validateQuestionData(questionData)) {
      return false;
    }

    // Valid answers are 'A' or 'B'
    return userAnswer === 'A' || userAnswer === 'B';
  }

  /**
   * Calculate score based on scoring mode
   *
   * For 'majority' mode, isCorrect should be set by the caller
   * based on whether the player's vote matches the majority.
   */
  public calculateScore(options: ScoreCalculationOptions) {
    const { questionData, isCorrect, responseTimeMs, questionDuration } = options;

    if (!this.validateQuestionData(questionData)) {
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

    const data = questionData as BalanceQuestionData;

    // No scoring mode - everyone gets participation points
    if (data.scoringMode === 'none' || !data.scoringMode) {
      return {
        points: 100, // Small participation points
        isCorrect: true,
        responseTimeMs,
        breakdown: {
          basePoints: 100,
          speedBonus: 0,
          totalPoints: 100,
        },
      };
    }

    // Majority mode - use base scoring
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

    // Award points for majority vote with speed bonus
    const basePoints = 500; // Lower than quiz games
    const duration = questionDuration || data.duration || 15;
    const remainingTime = Math.max(0, duration * 1000 - responseTimeMs);
    const speedBonus = Math.round((remainingTime / (duration * 1000)) * basePoints * 0.2);

    return {
      points: basePoints + speedBonus,
      isCorrect: true,
      responseTimeMs,
      breakdown: {
        basePoints,
        speedBonus,
        totalPoints: basePoints + speedBonus,
      },
    };
  }

  /**
   * Validate question data structure
   */
  public validateQuestionData(
    questionData: unknown
  ): questionData is BalanceQuestionData {
    if (typeof questionData !== 'object' || questionData === null) {
      return false;
    }

    const data = questionData as Partial<BalanceQuestionData>;

    return (
      data.type === 'balance-game' &&
      typeof data.optionA === 'string' &&
      data.optionA.length > 0 &&
      typeof data.optionB === 'string' &&
      data.optionB.length > 0
    );
  }

  /**
   * Get default question data template
   */
  public getDefaultQuestionData(): BalanceQuestionData {
    return {
      type: 'balance-game',
      optionA: '선택지 A',
      optionB: '선택지 B',
      explanation: '',
      duration: 15,
      scoringMode: 'none',
    };
  }
}
