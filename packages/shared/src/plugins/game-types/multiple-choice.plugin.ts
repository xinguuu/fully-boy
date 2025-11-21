import { BaseGameTypePlugin } from '../base-plugin';
import type { QuestionData } from '../../types/plugin.types';
import { PluginCategory } from '../../types/plugin.types';

/**
 * Multiple Choice Question Data
 */
export interface MultipleChoiceQuestionData extends QuestionData {
  type: 'multiple-choice';
  options: string[];
  correctAnswer: string | string[]; // Single or multiple correct answers
  explanation?: string;
  duration?: number;
  allowMultipleSelection?: boolean;
}

/**
 * Multiple Choice Plugin
 *
 * Standard multiple choice questions with 2-6 options.
 * Supports single or multiple correct answers.
 */
export class MultipleChoicePlugin extends BaseGameTypePlugin {
  public readonly type = 'multiple-choice';
  public readonly name = 'Multiple Choice';
  public readonly category = PluginCategory.QUIZ;

  /**
   * Check if user's answer matches the correct answer
   */
  public checkAnswer(questionData: QuestionData, userAnswer: unknown): boolean {
    if (!this.validateQuestionData(questionData)) {
      return false;
    }

    const correctAnswer = questionData.correctAnswer;

    // Multiple correct answers
    if (Array.isArray(correctAnswer)) {
      if (!Array.isArray(userAnswer)) {
        return false;
      }

      const sortedCorrect = [...correctAnswer].sort();
      const sortedUser = [...userAnswer].sort();

      return JSON.stringify(sortedCorrect) === JSON.stringify(sortedUser);
    }

    // Single correct answer
    return correctAnswer === userAnswer;
  }

  /**
   * Validate question data structure
   */
  public validateQuestionData(
    questionData: unknown
  ): questionData is MultipleChoiceQuestionData {
    if (typeof questionData !== 'object' || questionData === null) {
      return false;
    }

    const data = questionData as Partial<MultipleChoiceQuestionData>;

    return (
      data.type === 'multiple-choice' &&
      Array.isArray(data.options) &&
      data.options.length >= 2 &&
      data.options.length <= 6 &&
      (typeof data.correctAnswer === 'string' ||
        (Array.isArray(data.correctAnswer) && data.correctAnswer.length > 0))
    );
  }

  /**
   * Get default question data template
   */
  public getDefaultQuestionData(): MultipleChoiceQuestionData {
    return {
      type: 'multiple-choice',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 'Option 1',
      explanation: '',
      duration: 30,
      allowMultipleSelection: false,
    };
  }
}
