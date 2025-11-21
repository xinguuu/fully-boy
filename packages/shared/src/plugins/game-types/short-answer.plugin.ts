import { BaseGameTypePlugin } from '../base-plugin';
import type { QuestionData } from '../../types/plugin.types';
import { PluginCategory } from '../../types/plugin.types';

/**
 * Short Answer Question Data
 */
export interface ShortAnswerQuestionData extends QuestionData {
  type: 'short-answer';
  correctAnswer: string | string[]; // Multiple acceptable answers
  caseSensitive?: boolean;
  explanation?: string;
  duration?: number;
  maxLength?: number;
}

/**
 * Short Answer Plugin
 *
 * Free-form text input questions.
 * Supports multiple acceptable answers and case-insensitive matching.
 */
export class ShortAnswerPlugin extends BaseGameTypePlugin {
  public readonly type = 'short-answer';
  public readonly name = 'Short Answer';
  public readonly category = PluginCategory.QUIZ;

  /**
   * Check if user's answer matches any of the correct answers
   */
  public checkAnswer(questionData: QuestionData, userAnswer: unknown): boolean {
    if (!this.validateQuestionData(questionData)) {
      return false;
    }

    if (typeof userAnswer !== 'string') {
      return false;
    }

    const correctAnswers = Array.isArray(questionData.correctAnswer)
      ? questionData.correctAnswer
      : [questionData.correctAnswer];

    const caseSensitive = questionData.caseSensitive ?? false;
    const normalizedUserAnswer = caseSensitive
      ? userAnswer.trim()
      : userAnswer.trim().toLowerCase();

    return correctAnswers.some((correct: string) => {
      const normalizedCorrect = caseSensitive ? correct.trim() : correct.trim().toLowerCase();
      return normalizedCorrect === normalizedUserAnswer;
    });
  }

  /**
   * Validate question data structure
   */
  public validateQuestionData(questionData: unknown): questionData is ShortAnswerQuestionData {
    if (typeof questionData !== 'object' || questionData === null) {
      return false;
    }

    const data = questionData as Partial<ShortAnswerQuestionData>;

    return (
      data.type === 'short-answer' &&
      (typeof data.correctAnswer === 'string' ||
        (Array.isArray(data.correctAnswer) &&
          data.correctAnswer.length > 0 &&
          data.correctAnswer.every((ans) => typeof ans === 'string')))
    );
  }

  /**
   * Get default question data template
   */
  public getDefaultQuestionData(): ShortAnswerQuestionData {
    return {
      type: 'short-answer',
      correctAnswer: '',
      caseSensitive: false,
      explanation: '',
      duration: 30,
      maxLength: 100,
    };
  }
}
