import { describe, it, expect, beforeEach } from 'vitest';
import {
  TrueFalsePlugin,
  MultipleChoicePlugin,
  ShortAnswerPlugin,
  registerBuiltInPlugins,
  getBuiltInPlugins,
} from '../index';
import { gameTypeRegistry } from '../../registry';

describe('Built-in Game Type Plugins', () => {
  describe('TrueFalsePlugin', () => {
    let plugin: TrueFalsePlugin;

    beforeEach(() => {
      plugin = new TrueFalsePlugin();
    });

    it('should have correct type and name', () => {
      expect(plugin.type).toBe('true-false');
      expect(plugin.name).toBe('True/False (O/X)');
    });

    it('should validate correct question data', () => {
      const questionData = {
        type: 'true-false',
        options: ['O', 'X'],
        correctAnswer: 'O',
      };

      expect(plugin.validateQuestionData(questionData)).toBe(true);
    });

    it('should reject invalid question data', () => {
      const invalidData = [
        { type: 'true-false', options: ['Yes', 'No'], correctAnswer: 'Yes' },
        { type: 'true-false', options: ['O'], correctAnswer: 'O' },
        { type: 'true-false', correctAnswer: 'O' },
        { type: 'multiple-choice', options: ['O', 'X'], correctAnswer: 'O' },
      ];

      invalidData.forEach((data) => {
        expect(plugin.validateQuestionData(data)).toBe(false);
      });
    });

    it('should check correct answer', () => {
      const questionData = {
        type: 'true-false',
        options: ['O', 'X'],
        correctAnswer: 'O',
      };

      expect(plugin.checkAnswer(questionData, 'O')).toBe(true);
      expect(plugin.checkAnswer(questionData, 'X')).toBe(false);
    });

    it('should get default question data', () => {
      const defaultData = plugin.getDefaultQuestionData();
      expect(defaultData.type).toBe('true-false');
      expect(defaultData.options).toEqual(['O', 'X']);
      expect(defaultData.correctAnswer).toBe('O');
    });

    it('should calculate score correctly', () => {
      const result = plugin.calculateScore({
        isCorrect: true,
        responseTimeMs: 5000, // 5 seconds
        questionDuration: 30, // 30 seconds
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBeGreaterThan(1000); // Base + bonus
      expect(result.breakdown.basePoints).toBe(1000);
      expect(result.breakdown.speedBonus).toBeGreaterThan(0);
    });
  });

  describe('MultipleChoicePlugin', () => {
    let plugin: MultipleChoicePlugin;

    beforeEach(() => {
      plugin = new MultipleChoicePlugin();
    });

    it('should have correct type and name', () => {
      expect(plugin.type).toBe('multiple-choice');
      expect(plugin.name).toBe('Multiple Choice');
    });

    it('should validate correct question data', () => {
      const questionData = {
        type: 'multiple-choice',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
      };

      expect(plugin.validateQuestionData(questionData)).toBe(true);
    });

    it('should reject invalid question data', () => {
      const invalidData = [
        { type: 'multiple-choice', options: ['A'], correctAnswer: 'A' }, // Too few options
        { type: 'multiple-choice', correctAnswer: 'A' }, // Missing options
        { type: 'true-false', options: ['A', 'B'], correctAnswer: 'A' }, // Wrong type
      ];

      invalidData.forEach((data) => {
        expect(plugin.validateQuestionData(data)).toBe(false);
      });
    });

    it('should check single correct answer', () => {
      const questionData = {
        type: 'multiple-choice',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'B',
      };

      expect(plugin.checkAnswer(questionData, 'B')).toBe(true);
      expect(plugin.checkAnswer(questionData, 'A')).toBe(false);
    });

    it('should check multiple correct answers', () => {
      const questionData = {
        type: 'multiple-choice',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: ['B', 'C'],
      };

      expect(plugin.checkAnswer(questionData, ['B', 'C'])).toBe(true);
      expect(plugin.checkAnswer(questionData, ['C', 'B'])).toBe(true); // Order doesn't matter
      expect(plugin.checkAnswer(questionData, ['B'])).toBe(false);
      expect(plugin.checkAnswer(questionData, ['A', 'B'])).toBe(false);
    });

    it('should get default question data', () => {
      const defaultData = plugin.getDefaultQuestionData();
      expect(defaultData.type).toBe('multiple-choice');
      expect(defaultData.options).toHaveLength(4);
      expect(defaultData.correctAnswer).toBe('Option 1');
    });
  });

  describe('ShortAnswerPlugin', () => {
    let plugin: ShortAnswerPlugin;

    beforeEach(() => {
      plugin = new ShortAnswerPlugin();
    });

    it('should have correct type and name', () => {
      expect(plugin.type).toBe('short-answer');
      expect(plugin.name).toBe('Short Answer');
    });

    it('should validate correct question data', () => {
      const questionData = {
        type: 'short-answer',
        correctAnswer: 'Seoul',
      };

      expect(plugin.validateQuestionData(questionData)).toBe(true);
    });

    it('should reject invalid question data', () => {
      const invalidData = [
        { type: 'short-answer' }, // Missing correctAnswer
        { type: 'short-answer', correctAnswer: [] }, // Empty array
        { type: 'multiple-choice', correctAnswer: 'Seoul' }, // Wrong type
      ];

      invalidData.forEach((data) => {
        expect(plugin.validateQuestionData(data)).toBe(false);
      });
    });

    it('should check answer case-insensitively by default', () => {
      const questionData = {
        type: 'short-answer',
        correctAnswer: 'Seoul',
      };

      expect(plugin.checkAnswer(questionData, 'Seoul')).toBe(true);
      expect(plugin.checkAnswer(questionData, 'seoul')).toBe(true);
      expect(plugin.checkAnswer(questionData, 'SEOUL')).toBe(true);
      expect(plugin.checkAnswer(questionData, '  Seoul  ')).toBe(true); // Trim whitespace
      expect(plugin.checkAnswer(questionData, 'Busan')).toBe(false);
    });

    it('should check answer case-sensitively when enabled', () => {
      const questionData = {
        type: 'short-answer',
        correctAnswer: 'Seoul',
        caseSensitive: true,
      };

      expect(plugin.checkAnswer(questionData, 'Seoul')).toBe(true);
      expect(plugin.checkAnswer(questionData, 'seoul')).toBe(false);
      expect(plugin.checkAnswer(questionData, 'SEOUL')).toBe(false);
    });

    it('should accept multiple correct answers', () => {
      const questionData = {
        type: 'short-answer',
        correctAnswer: ['Seoul', '서울', 'Seoul City'],
      };

      expect(plugin.checkAnswer(questionData, 'Seoul')).toBe(true);
      expect(plugin.checkAnswer(questionData, '서울')).toBe(true);
      expect(plugin.checkAnswer(questionData, 'seoul city')).toBe(true);
      expect(plugin.checkAnswer(questionData, 'Busan')).toBe(false);
    });

    it('should reject non-string answers', () => {
      const questionData = {
        type: 'short-answer',
        correctAnswer: 'Seoul',
      };

      expect(plugin.checkAnswer(questionData, 123)).toBe(false);
      expect(plugin.checkAnswer(questionData, null)).toBe(false);
      expect(plugin.checkAnswer(questionData, undefined)).toBe(false);
    });

    it('should get default question data', () => {
      const defaultData = plugin.getDefaultQuestionData();
      expect(defaultData.type).toBe('short-answer');
      expect(defaultData.correctAnswer).toBe('');
      expect(defaultData.caseSensitive).toBe(false);
      expect(defaultData.maxLength).toBe(100);
    });
  });

  describe('registerBuiltInPlugins()', () => {
    beforeEach(() => {
      gameTypeRegistry.clear();
    });

    it('should register all built-in plugins', () => {
      expect(gameTypeRegistry.size()).toBe(0);

      registerBuiltInPlugins();

      expect(gameTypeRegistry.size()).toBe(3);
      expect(gameTypeRegistry.has('true-false')).toBe(true);
      expect(gameTypeRegistry.has('multiple-choice')).toBe(true);
      expect(gameTypeRegistry.has('short-answer')).toBe(true);
    });

    it('should get built-in plugins', () => {
      const plugins = getBuiltInPlugins();

      expect(plugins.trueFalse).toBeInstanceOf(TrueFalsePlugin);
      expect(plugins.multipleChoice).toBeInstanceOf(MultipleChoicePlugin);
      expect(plugins.shortAnswer).toBeInstanceOf(ShortAnswerPlugin);
    });
  });
});
