import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  parseQuestionData,
  isQuestionData,
  getQuestionDuration,
  getQuestionType,
} from '../question.utils';
import { gameTypeRegistry } from '../../plugins/registry';
import { registerBuiltInPlugins } from '../../plugins/game-types';

describe('Question Utils', () => {
  beforeEach(() => {
    // Clear and re-register plugins before each test
    gameTypeRegistry.clear();
    registerBuiltInPlugins();
  });

  afterEach(() => {
    // Clean up after tests
    gameTypeRegistry.clear();
  });

  describe('parseQuestionData', () => {
    it('should parse valid multiple-choice question data', () => {
      const validData = {
        type: 'multiple-choice',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        duration: 30,
      };

      const result = parseQuestionData(validData);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('multiple-choice');
      expect(result?.duration).toBe(30);
    });

    it('should parse valid true-false question data', () => {
      const validData = {
        type: 'true-false',
        options: ['O', 'X'],
        correctAnswer: 'O',
        duration: 20,
      };

      const result = parseQuestionData(validData);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('true-false');
    });

    it('should parse valid short-answer question data', () => {
      const validData = {
        type: 'short-answer',
        correctAnswer: 'Seoul',
        caseSensitive: false,
        duration: 45,
      };

      const result = parseQuestionData(validData);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('short-answer');
    });

    it('should return null for non-object data', () => {
      expect(parseQuestionData(null)).toBeNull();
      expect(parseQuestionData(undefined)).toBeNull();
      expect(parseQuestionData('string')).toBeNull();
      expect(parseQuestionData(123)).toBeNull();
      expect(parseQuestionData(true)).toBeNull();
    });

    it('should return null for data without type field', () => {
      const invalidData = {
        options: ['A', 'B', 'C'],
        correctAnswer: 'A',
      };

      expect(parseQuestionData(invalidData)).toBeNull();
    });

    it('should return null for data with invalid type', () => {
      const invalidData = {
        type: 123, // Should be string
        options: ['A', 'B', 'C'],
        correctAnswer: 'A',
      };

      expect(parseQuestionData(invalidData)).toBeNull();
    });

    it('should return null for unregistered question type', () => {
      const unknownTypeData = {
        type: 'unknown-type',
        data: 'some data',
      };

      expect(parseQuestionData(unknownTypeData)).toBeNull();
    });

    it('should return null for invalid question data structure', () => {
      const invalidData = {
        type: 'multiple-choice',
        options: ['Only One'], // Too few options
        correctAnswer: 'Only One',
      };

      expect(parseQuestionData(invalidData)).toBeNull();
    });

    it('should handle data from JSON parsing (Prisma)', () => {
      // Simulate data from database
      const jsonString = JSON.stringify({
        type: 'multiple-choice',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        duration: 30,
      });
      const parsedData = JSON.parse(jsonString);

      const result = parseQuestionData(parsedData);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('multiple-choice');
    });
  });

  describe('isQuestionData', () => {
    it('should return true for object with type field', () => {
      const data = {
        type: 'multiple-choice',
        someOtherField: 'value',
      };

      expect(isQuestionData(data)).toBe(true);
    });

    it('should return false for non-object', () => {
      expect(isQuestionData(null)).toBe(false);
      expect(isQuestionData(undefined)).toBe(false);
      expect(isQuestionData('string')).toBe(false);
      expect(isQuestionData(123)).toBe(false);
    });

    it('should return false for object without type field', () => {
      const data = {
        options: ['A', 'B', 'C'],
      };

      expect(isQuestionData(data)).toBe(false);
    });

    it('should return false for object with non-string type', () => {
      const data = {
        type: 123,
      };

      expect(isQuestionData(data)).toBe(false);
    });
  });

  describe('getQuestionDuration', () => {
    it('should return duration from question data', () => {
      const questionData = {
        type: 'multiple-choice',
        duration: 45,
      };

      expect(getQuestionDuration(questionData)).toBe(45);
    });

    it('should return default duration when not specified', () => {
      const questionData = {
        type: 'multiple-choice',
      };

      expect(getQuestionDuration(questionData)).toBe(30);
    });

    it('should return custom default duration', () => {
      const questionData = {
        type: 'multiple-choice',
      };

      expect(getQuestionDuration(questionData, 60)).toBe(60);
    });

    it('should return default for invalid duration', () => {
      const questionData = {
        type: 'multiple-choice',
        duration: -10, // Invalid
      };

      expect(getQuestionDuration(questionData)).toBe(30);
    });

    it('should return default for non-number duration', () => {
      const questionData = {
        type: 'multiple-choice',
        duration: 'invalid' as any,
      };

      expect(getQuestionDuration(questionData)).toBe(30);
    });

    it('should return default for zero duration', () => {
      const questionData = {
        type: 'multiple-choice',
        duration: 0,
      };

      expect(getQuestionDuration(questionData)).toBe(30);
    });
  });

  describe('getQuestionType', () => {
    it('should return question type', () => {
      const questionData = {
        type: 'multiple-choice',
        duration: 30,
      };

      expect(getQuestionType(questionData)).toBe('multiple-choice');
    });

    it('should return type for different question types', () => {
      expect(getQuestionType({ type: 'true-false' })).toBe('true-false');
      expect(getQuestionType({ type: 'short-answer' })).toBe('short-answer');
    });
  });
});
