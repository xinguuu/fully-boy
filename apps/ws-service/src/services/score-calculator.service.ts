/**
 * Score Calculator Service
 *
 * Calculates scores based on:
 * - Correctness (base points)
 * - Response time (bonus points for speed)
 */

interface ScoreCalculationOptions {
  isCorrect: boolean;
  responseTimeMs: number;
  questionDuration: number; // in seconds
  basePoints?: number;
  speedBonusMultiplier?: number;
}

interface ScoreResult {
  points: number;
  isCorrect: boolean;
  responseTimeMs: number;
  breakdown: {
    basePoints: number;
    speedBonus: number;
    totalPoints: number;
  };
}

export class ScoreCalculatorService {
  private readonly DEFAULT_BASE_POINTS = 1000;
  private readonly DEFAULT_SPEED_BONUS_MULTIPLIER = 0.5;

  /**
   * Calculate score for an answer
   *
   * Formula:
   * - Correct answer: basePoints + speedBonus
   * - Wrong answer: 0 points
   * - Speed bonus: (remainingTime / totalTime) * basePoints * multiplier
   */
  calculateScore(options: ScoreCalculationOptions): ScoreResult {
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
   * Check if answer is correct based on question type
   */
  checkAnswer(question: any, userAnswer: any): boolean {
    const questionData = question.data;
    const questionType = questionData.type || 'multiple-choice';

    switch (questionType) {
      case 'multiple-choice':
        return this.checkMultipleChoice(questionData, userAnswer);
      case 'true-false':
        return this.checkTrueFalse(questionData, userAnswer);
      case 'short-answer':
        return this.checkShortAnswer(questionData, userAnswer);
      default:
        console.warn(`Unknown question type: ${questionType}`);
        return false;
    }
  }

  private checkMultipleChoice(questionData: any, userAnswer: any): boolean {
    const correctAnswer = questionData.correctAnswer;

    if (Array.isArray(correctAnswer)) {
      // Multiple correct answers
      if (!Array.isArray(userAnswer)) return false;

      const sortedCorrect = [...correctAnswer].sort();
      const sortedUser = [...userAnswer].sort();

      return JSON.stringify(sortedCorrect) === JSON.stringify(sortedUser);
    }

    return correctAnswer === userAnswer;
  }

  private checkTrueFalse(questionData: any, userAnswer: any): boolean {
    return questionData.correctAnswer === userAnswer;
  }

  private checkShortAnswer(questionData: any, userAnswer: any): boolean {
    if (typeof userAnswer !== 'string') return false;

    const correctAnswers = Array.isArray(questionData.correctAnswer)
      ? questionData.correctAnswer
      : [questionData.correctAnswer];

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();

    return correctAnswers.some((correct: string) =>
      correct.trim().toLowerCase() === normalizedUserAnswer
    );
  }
}

export const scoreCalculator = new ScoreCalculatorService();
