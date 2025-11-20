import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreCalculatorService } from '../services/score-calculator.service';

describe('ScoreCalculatorService', () => {
  let service: ScoreCalculatorService;

  beforeEach(() => {
    service = new ScoreCalculatorService();
  });

  describe('calculateScore', () => {
    it('should give maximum points for instant correct answer', () => {
      const result = service.calculateScore('multiple-choice', {
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
      const result = service.calculateScore('multiple-choice', {
        isCorrect: true,
        responseTimeMs: 15000, // 15s out of 30s
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(1250); // 1000 base + 250 speed bonus (50% time remaining)
      expect(result.breakdown.speedBonus).toBe(250);
    });

    it('should give no speed bonus for answer at deadline', () => {
      const result = service.calculateScore('multiple-choice', {
        isCorrect: true,
        responseTimeMs: 30000, // exactly at 30s deadline
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(1000); // 1000 base + 0 speed bonus
      expect(result.breakdown.speedBonus).toBe(0);
    });

    it('should give no speed bonus for answer after deadline', () => {
      const result = service.calculateScore('multiple-choice', {
        isCorrect: true,
        responseTimeMs: 35000, // 5s over deadline
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(1000); // 1000 base + 0 speed bonus (capped at 0)
      expect(result.breakdown.speedBonus).toBe(0);
    });

    it('should give 0 points for incorrect answer', () => {
      const result = service.calculateScore('multiple-choice', {
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
      const result = service.calculateScore('multiple-choice', {
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
      const result = service.calculateScore('multiple-choice', {
        isCorrect: true,
        responseTimeMs: 0,
        questionDuration: 30,
        speedBonusMultiplier: 1.0, // 100% bonus instead of 50%
      });

      expect(result.points).toBe(2000); // 1000 base + 1000 speed bonus
      expect(result.breakdown.speedBonus).toBe(1000);
    });

    it('should round down speed bonus to integer', () => {
      const result = service.calculateScore('multiple-choice', {
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
    it('should check multiple-choice questions correctly', () => {
      const question = {
        data: {
          type: 'multiple-choice',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'B',
        },
      };

      expect(service.checkAnswer(question, 'B')).toBe(true);
      expect(service.checkAnswer(question, 'A')).toBe(false);
    });

    it('should check true-false questions correctly', () => {
      const question = {
        data: {
          type: 'true-false',
          options: ['O', 'X'],
          correctAnswer: 'O',
        },
      };

      expect(service.checkAnswer(question, 'O')).toBe(true);
      expect(service.checkAnswer(question, 'X')).toBe(false);
    });

    it('should check short-answer questions correctly', () => {
      const question = {
        data: {
          type: 'short-answer',
          correctAnswer: 'Paris',
        },
      };

      expect(service.checkAnswer(question, 'paris')).toBe(true);
      expect(service.checkAnswer(question, 'London')).toBe(false);
    });

    it('should handle missing question data', () => {
      const question = {
        data: null,
      };

      expect(service.checkAnswer(question, 'test')).toBe(false);
    });

    it('should handle unknown question type', () => {
      const question = {
        data: {
          type: 'unknown-type',
          correctAnswer: 'test',
        },
      };

      expect(service.checkAnswer(question, 'test')).toBe(false);
    });
  });
});
