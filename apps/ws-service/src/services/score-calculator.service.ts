import {
  gameTypeRegistry,
  parseQuestionData,
  type ScoreCalculationOptions,
  type ScoreResult,
} from '@xingu/shared';

/**
 * Score Calculator Service (Plugin-based)
 *
 * Delegates score calculation and answer checking to registered game type plugins.
 * This service is now plugin-agnostic and extensible with type-safe validation.
 */
export class ScoreCalculatorService {
  /**
   * Calculate score for an answer using the appropriate plugin
   *
   * @param questionType - Type of the question (e.g., 'multiple-choice', 'true-false')
   * @param options - Score calculation options
   * @returns Score result with breakdown
   * @throws Error if plugin for question type is not registered
   */
  calculateScore(questionType: string, options: ScoreCalculationOptions): ScoreResult {
    const plugin = gameTypeRegistry.get(questionType);

    if (!plugin) {
      throw new Error(
        `No plugin registered for question type: "${questionType}". ` +
          `Available types: ${gameTypeRegistry.getAllTypes().join(', ')}`
      );
    }

    return plugin.calculateScore(options);
  }

  /**
   * Check if answer is correct based on question type
   *
   * Uses parseQuestionData for type-safe validation before checking answer.
   *
   * @param question - Question object with data field
   * @param userAnswer - User's submitted answer
   * @returns true if answer is correct, false otherwise
   */
  checkAnswer(question: { data: unknown }, userAnswer: unknown): boolean {
    // Parse and validate question data with type safety
    const questionData = parseQuestionData(question.data);

    if (!questionData) {
      console.warn('Invalid or missing question data:', question.data);
      return false;
    }

    const questionType = questionData.type;
    const plugin = gameTypeRegistry.get(questionType);

    if (!plugin) {
      console.warn(
        `No plugin registered for question type: "${questionType}". ` +
          `Available types: ${gameTypeRegistry.getAllTypes().join(', ')}`
      );
      return false;
    }

    return plugin.checkAnswer(questionData, userAnswer);
  }
}

export const scoreCalculator = new ScoreCalculatorService();
