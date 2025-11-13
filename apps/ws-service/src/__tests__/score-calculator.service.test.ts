import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreCalculatorService } from '../services/score-calculator.service';

describe('ScoreCalculatorService', () => {
  let service: ScoreCalculatorService;

  beforeEach(() => {
    service = new ScoreCalculatorService();
  });

  describe('calculateScore', () => {
    it('should give maximum points for instant correct answer', () => {
      const result = service.calculateScore({
        isCorrect: true,
        responseTimeMs: 0,
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(1500); // 1000 base + 500 speed bonus (full time remaining)
      expect(result.breakdown.basePoints).toBe(1000);
      expect(result.breakdown.speedBonus).toBe(500);
      expect(result.breakdown.totalPoints).toBe(1500);
    });

    it('should give medium bonus for mid-time correct answer', () => {
      const result = service.calculateScore({
        isCorrect: true,
        responseTimeMs: 15000, // 15s out of 30s
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(1250); // 1000 base + 250 speed bonus (50% time remaining)
      expect(result.breakdown.speedBonus).toBe(250);
    });

    it('should give no speed bonus for answer at deadline', () => {
      const result = service.calculateScore({
        isCorrect: true,
        responseTimeMs: 30000, // exactly at 30s deadline
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(1000); // 1000 base + 0 speed bonus
      expect(result.breakdown.speedBonus).toBe(0);
    });

    it('should give no speed bonus for answer after deadline', () => {
      const result = service.calculateScore({
        isCorrect: true,
        responseTimeMs: 35000, // 5s over deadline
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(1000); // 1000 base + 0 speed bonus (capped at 0)
      expect(result.breakdown.speedBonus).toBe(0);
    });

    it('should give 0 points for incorrect answer', () => {
      const result = service.calculateScore({
        isCorrect: false,
        responseTimeMs: 0,
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(0);
      expect(result.breakdown.basePoints).toBe(0);
      expect(result.breakdown.speedBonus).toBe(0);
      expect(result.breakdown.totalPoints).toBe(0);
    });

    it('should support custom base points', () => {
      const result = service.calculateScore({
        isCorrect: true,
        responseTimeMs: 0,
        questionDuration: 30,
        basePoints: 500,
      });

      expect(result.points).toBe(750); // 500 base + 250 speed bonus
      expect(result.breakdown.basePoints).toBe(500);
      expect(result.breakdown.speedBonus).toBe(250);
    });

    it('should support custom speed bonus multiplier', () => {
      const result = service.calculateScore({
        isCorrect: true,
        responseTimeMs: 0,
        questionDuration: 30,
        speedBonusMultiplier: 1.0, // 100% bonus instead of 50%
      });

      expect(result.points).toBe(2000); // 1000 base + 1000 speed bonus
      expect(result.breakdown.speedBonus).toBe(1000);
    });

    it('should round down speed bonus to integer', () => {
      const result = service.calculateScore({
        isCorrect: true,
        responseTimeMs: 10000, // 10s out of 30s = 66.67% remaining
        questionDuration: 30,
      });

      // timeRatio = 20/30 = 0.6667
      // speedBonus = floor(1000 * 0.5 * 0.6667) = floor(333.35) = 333
      expect(result.breakdown.speedBonus).toBe(333);
      expect(result.points).toBe(1333);
    });
  });

  describe('checkAnswer', () => {
    it('should route to checkMultipleChoice for multiple-choice questions', () => {
      const question = {
        data: {
          type: 'multiple-choice',
          correctAnswer: 'B',
        },
      };

      expect(service.checkAnswer(question, 'B')).toBe(true);
      expect(service.checkAnswer(question, 'A')).toBe(false);
    });

    it('should route to checkTrueFalse for true-false questions', () => {
      const question = {
        data: {
          type: 'true-false',
          correctAnswer: true,
        },
      };

      expect(service.checkAnswer(question, true)).toBe(true);
      expect(service.checkAnswer(question, false)).toBe(false);
    });

    it('should route to checkShortAnswer for short-answer questions', () => {
      const question = {
        data: {
          type: 'short-answer',
          correctAnswer: 'Paris',
        },
      };

      expect(service.checkAnswer(question, 'paris')).toBe(true);
      expect(service.checkAnswer(question, 'London')).toBe(false);
    });

    it('should default to multiple-choice if type is not specified', () => {
      const question = {
        data: {
          correctAnswer: 'C',
        },
      };

      expect(service.checkAnswer(question, 'C')).toBe(true);
    });

    it('should return false for unknown question type', () => {
      const question = {
        data: {
          type: 'unknown-type',
          correctAnswer: 'test',
        },
      };

      expect(service.checkAnswer(question, 'test')).toBe(false);
    });
  });

  describe('checkMultipleChoice', () => {
    it('should match single correct answer', () => {
      const questionData = { correctAnswer: 'B' };
      expect(service['checkMultipleChoice'](questionData, 'B')).toBe(true);
    });

    it('should reject wrong single answer', () => {
      const questionData = { correctAnswer: 'B' };
      expect(service['checkMultipleChoice'](questionData, 'A')).toBe(false);
    });

    it('should match multiple correct answers (order independent)', () => {
      const questionData = { correctAnswer: ['A', 'C', 'D'] };
      expect(service['checkMultipleChoice'](questionData, ['D', 'A', 'C'])).toBe(true);
    });

    it('should match multiple correct answers (same order)', () => {
      const questionData = { correctAnswer: ['A', 'B'] };
      expect(service['checkMultipleChoice'](questionData, ['A', 'B'])).toBe(true);
    });

    it('should reject partial match for multiple answers', () => {
      const questionData = { correctAnswer: ['A', 'B', 'C'] };
      expect(service['checkMultipleChoice'](questionData, ['A', 'B'])).toBe(false);
    });

    it('should reject extra answers', () => {
      const questionData = { correctAnswer: ['A', 'B'] };
      expect(service['checkMultipleChoice'](questionData, ['A', 'B', 'C'])).toBe(false);
    });

    it('should reject non-array when multiple answers expected', () => {
      const questionData = { correctAnswer: ['A', 'B'] };
      expect(service['checkMultipleChoice'](questionData, 'A')).toBe(false);
    });
  });

  describe('checkTrueFalse', () => {
    it('should match true answer', () => {
      const questionData = { correctAnswer: true };
      expect(service['checkTrueFalse'](questionData, true)).toBe(true);
    });

    it('should match false answer', () => {
      const questionData = { correctAnswer: false };
      expect(service['checkTrueFalse'](questionData, false)).toBe(true);
    });

    it('should reject wrong boolean', () => {
      const questionData = { correctAnswer: true };
      expect(service['checkTrueFalse'](questionData, false)).toBe(false);
    });
  });

  describe('checkShortAnswer', () => {
    it('should match exact answer (case insensitive)', () => {
      const questionData = { correctAnswer: 'Paris' };
      expect(service['checkShortAnswer'](questionData, 'paris')).toBe(true);
      expect(service['checkShortAnswer'](questionData, 'PARIS')).toBe(true);
      expect(service['checkShortAnswer'](questionData, 'Paris')).toBe(true);
    });

    it('should trim whitespace from answer', () => {
      const questionData = { correctAnswer: 'Paris' };
      expect(service['checkShortAnswer'](questionData, '  paris  ')).toBe(true);
    });

    it('should match any of multiple acceptable answers', () => {
      const questionData = { correctAnswer: ['Seoul', 'Korea'] };
      expect(service['checkShortAnswer'](questionData, 'seoul')).toBe(true);
      expect(service['checkShortAnswer'](questionData, 'korea')).toBe(true);
      expect(service['checkShortAnswer'](questionData, 'Tokyo')).toBe(false);
    });

    it('should reject non-string answers', () => {
      const questionData = { correctAnswer: 'Paris' };
      expect(service['checkShortAnswer'](questionData, 123)).toBe(false);
      expect(service['checkShortAnswer'](questionData, null)).toBe(false);
      expect(service['checkShortAnswer'](questionData, undefined)).toBe(false);
    });

    it('should reject wrong answer', () => {
      const questionData = { correctAnswer: 'Paris' };
      expect(service['checkShortAnswer'](questionData, 'London')).toBe(false);
    });
  });
});
