import { BaseGameTypePlugin } from '../base-plugin';
import type { QuestionData } from '../../types/plugin.types';
import { PluginCategory } from '../../types/plugin.types';

/**
 * True/False Question Data
 */
export interface TrueFalseQuestionData extends QuestionData {
  type: 'true-false';
  options: ['O', 'X'];
  correctAnswer: 'O' | 'X';
  explanation?: string;
  duration?: number;
}

/**
 * True/False (O/X) Plugin
 *
 * Simple yes/no questions with two options.
 * Commonly used for quick quizzes and fact checking.
 */
export class TrueFalsePlugin extends BaseGameTypePlugin {
  public readonly type = 'true-false';
  public readonly name = 'True/False (O/X)';
  public readonly category = PluginCategory.QUIZ;

  /**
   * Check if user's answer matches the correct answer
   */
  public checkAnswer(questionData: QuestionData, userAnswer: unknown): boolean {
    if (!this.validateQuestionData(questionData)) {
      return false;
    }

    return questionData.correctAnswer === userAnswer;
  }

  /**
   * Validate question data structure
   */
  public validateQuestionData(questionData: unknown): questionData is TrueFalseQuestionData {
    if (typeof questionData !== 'object' || questionData === null) {
      return false;
    }

    const data = questionData as Partial<TrueFalseQuestionData>;

    return (
      data.type === 'true-false' &&
      Array.isArray(data.options) &&
      data.options.length === 2 &&
      data.options[0] === 'O' &&
      data.options[1] === 'X' &&
      (data.correctAnswer === 'O' || data.correctAnswer === 'X')
    );
  }

  /**
   * Get default question data template
   */
  public getDefaultQuestionData(): TrueFalseQuestionData {
    return {
      type: 'true-false',
      options: ['O', 'X'],
      correctAnswer: 'O',
      explanation: '',
      duration: 30,
    };
  }
}
