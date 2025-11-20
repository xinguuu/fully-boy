import { gameTypeRegistry } from '../plugins/registry';
import type { QuestionData } from '../types/plugin.types';

/**
 * Parse and validate question data
 *
 * Safely converts unknown data to QuestionData with validation.
 * Uses plugin's validateQuestionData method for type-specific validation.
 *
 * @param data - Unknown data from database or API
 * @returns Validated QuestionData or null if invalid
 *
 * @example
 * const questionData = parseQuestionData(question.data);
 * if (!questionData) {
 *   throw new Error('Invalid question data');
 * }
 * console.log(questionData.type); // Type-safe access
 */
export function parseQuestionData(data: unknown): QuestionData | null {
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    console.warn('Question data is not an object:', data);
    return null;
  }

  const parsed = data as Partial<QuestionData>;

  // Check if type field exists
  if (!parsed.type || typeof parsed.type !== 'string') {
    console.warn('Question data missing or invalid "type" field:', data);
    return null;
  }

  // Get plugin for this question type
  const plugin = gameTypeRegistry.get(parsed.type);
  if (!plugin) {
    console.warn(
      `No plugin registered for question type: "${parsed.type}". ` +
        `Available types: ${gameTypeRegistry.getAllTypes().join(', ')}`
    );
    return null;
  }

  // Validate with plugin
  if (!plugin.validateQuestionData(data)) {
    console.warn(`Invalid question data for type "${parsed.type}":`, data);
    return null;
  }

  return data as QuestionData;
}

/**
 * Type guard for QuestionData
 *
 * Checks if data is valid QuestionData without using plugin validation.
 * Useful for basic type checking before plugin is available.
 *
 * @param data - Unknown data to check
 * @returns true if data has QuestionData shape
 */
export function isQuestionData(data: unknown): data is QuestionData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const d = data as Partial<QuestionData>;
  return typeof d.type === 'string';
}

/**
 * Extract question duration with fallback
 *
 * Safely extracts duration from question data with type checking.
 *
 * @param questionData - Validated question data
 * @param defaultDuration - Default duration in seconds (default: 30)
 * @returns Duration in seconds
 */
export function getQuestionDuration(
  questionData: QuestionData,
  defaultDuration = 30
): number {
  const duration = questionData.duration;

  if (typeof duration === 'number' && duration > 0) {
    return duration;
  }

  return defaultDuration;
}

/**
 * Extract question type safely
 *
 * @param questionData - Validated question data
 * @returns Question type string
 */
export function getQuestionType(questionData: QuestionData): string {
  return questionData.type;
}
