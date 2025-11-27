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
      // DEFAULT_BASE_POINTS=100, DEFAULT_SPEED_BONUS_MULTIPLIER=0.3
      // speedBonus = floor(100 * 0.3 * 1.0) = 30
      expect(result.points).toBe(130); // 100 base + 30 speed bonus (full time remaining)
      expect(result.breakdown.basePoints).toBe(100);
      expect(result.breakdown.speedBonus).toBe(30);
      expect(result.breakdown.totalPoints).toBe(130);
    });

    it('should give medium bonus for mid-time correct answer', () => {
      const result = service.calculateScore('multiple-choice', {
        isCorrect: true,
        responseTimeMs: 15000, // 15s out of 30s
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(true);
      // speedBonus = floor(100 * 0.3 * 0.5) = 15
      expect(result.points).toBe(115); // 100 base + 15 speed bonus (50% time remaining)
      expect(result.breakdown.speedBonus).toBe(15);
    });

    it('should give no speed bonus for answer at deadline', () => {
      const result = service.calculateScore('multiple-choice', {
        isCorrect: true,
        responseTimeMs: 30000, // exactly at 30s deadline
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(100); // 100 base + 0 speed bonus
      expect(result.breakdown.speedBonus).toBe(0);
    });

    it('should give no speed bonus for answer after deadline', () => {
      const result = service.calculateScore('multiple-choice', {
        isCorrect: true,
        responseTimeMs: 35000, // 5s over deadline
        questionDuration: 30,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBe(100); // 100 base + 0 speed bonus (capped at 0)
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

      // speedBonus = floor(500 * 0.3 * 1.0) = 150
      expect(result.points).toBe(650); // 500 base + 150 speed bonus
      expect(result.breakdown.basePoints).toBe(500);
      expect(result.breakdown.speedBonus).toBe(150);
    });

    it('should support custom speed bonus multiplier', () => {
      const result = service.calculateScore('multiple-choice', {
        isCorrect: true,
        responseTimeMs: 0,
        questionDuration: 30,
        speedBonusMultiplier: 1.0, // 100% bonus instead of 30%
      });

      // speedBonus = floor(100 * 1.0 * 1.0) = 100
      expect(result.points).toBe(200); // 100 base + 100 speed bonus
      expect(result.breakdown.speedBonus).toBe(100);
    });

    it('should round down speed bonus to integer', () => {
      const result = service.calculateScore('multiple-choice', {
        isCorrect: true,
        responseTimeMs: 10000, // 10s out of 30s = 66.67% remaining
        questionDuration: 30,
      });

      // timeRatio = 20/30 = 0.6667
      // speedBonus = floor(100 * 0.3 * 0.6667) = floor(20) = 20
      expect(result.breakdown.speedBonus).toBe(20);
      expect(result.points).toBe(120);
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
