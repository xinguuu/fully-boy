import { describe, it, expect, beforeEach } from 'vitest';
import { GameTypeRegistry } from '../registry';
import type { GameTypePlugin, QuestionData } from '../../types/plugin.types';

// Mock plugin for testing
class MockPlugin implements GameTypePlugin {
  public readonly type = 'mock-plugin';
  public readonly name = 'Mock Plugin';

  checkAnswer(_questionData: QuestionData, _userAnswer: unknown): boolean {
    return true;
  }

  calculateScore(): any {
    return {
      points: 100,
      isCorrect: true,
      responseTimeMs: 1000,
      breakdown: { basePoints: 100, speedBonus: 0, totalPoints: 100 },
    };
  }

  validateQuestionData(_questionData: unknown): _questionData is QuestionData {
    return true;
  }

  getDefaultQuestionData(): QuestionData {
    return { type: 'mock-plugin' };
  }
}

describe('GameTypeRegistry', () => {
  let registry: GameTypeRegistry;
  let mockPlugin: MockPlugin;

  beforeEach(() => {
    // Get fresh instance and clear it
    registry = GameTypeRegistry.getInstance();
    registry.clear();
    mockPlugin = new MockPlugin();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = GameTypeRegistry.getInstance();
      const instance2 = GameTypeRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('register()', () => {
    it('should register a plugin successfully', () => {
      registry.register(mockPlugin);
      expect(registry.has('mock-plugin')).toBe(true);
      expect(registry.size()).toBe(1);
    });

    it('should throw error when registering duplicate plugin type', () => {
      registry.register(mockPlugin);
      expect(() => registry.register(mockPlugin)).toThrow(
        'Plugin with type "mock-plugin" is already registered'
      );
    });
  });

  describe('unregister()', () => {
    it('should unregister a plugin successfully', () => {
      registry.register(mockPlugin);
      expect(registry.has('mock-plugin')).toBe(true);

      const result = registry.unregister('mock-plugin');
      expect(result).toBe(true);
      expect(registry.has('mock-plugin')).toBe(false);
      expect(registry.size()).toBe(0);
    });

    it('should return false when unregistering non-existent plugin', () => {
      const result = registry.unregister('non-existent');
      expect(result).toBe(false);
    });

    it('should allow re-registration after unregistering', () => {
      registry.register(mockPlugin);
      registry.unregister('mock-plugin');

      // Should not throw
      expect(() => registry.register(mockPlugin)).not.toThrow();
      expect(registry.has('mock-plugin')).toBe(true);
    });
  });

  describe('get()', () => {
    it('should retrieve registered plugin', () => {
      registry.register(mockPlugin);
      const retrieved = registry.get('mock-plugin');
      expect(retrieved).toBe(mockPlugin);
    });

    it('should return undefined for non-existent plugin', () => {
      const retrieved = registry.get('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('has()', () => {
    it('should return true for registered plugin', () => {
      registry.register(mockPlugin);
      expect(registry.has('mock-plugin')).toBe(true);
    });

    it('should return false for non-registered plugin', () => {
      expect(registry.has('non-existent')).toBe(false);
    });
  });

  describe('getAll()', () => {
    it('should return empty array when no plugins registered', () => {
      const plugins = registry.getAll();
      expect(plugins).toEqual([]);
      expect(plugins.length).toBe(0);
    });

    it('should return all registered plugins', () => {
      const mockPlugin2 = new MockPlugin();
      Object.defineProperty(mockPlugin2, 'type', { value: 'mock-plugin-2' });

      registry.register(mockPlugin);
      registry.register(mockPlugin2);

      const plugins = registry.getAll();
      expect(plugins).toHaveLength(2);
      expect(plugins).toContain(mockPlugin);
      expect(plugins).toContain(mockPlugin2);
    });
  });

  describe('getAllTypes()', () => {
    it('should return empty array when no plugins registered', () => {
      const types = registry.getAllTypes();
      expect(types).toEqual([]);
    });

    it('should return all registered plugin types', () => {
      const mockPlugin2 = new MockPlugin();
      Object.defineProperty(mockPlugin2, 'type', { value: 'mock-plugin-2' });

      registry.register(mockPlugin);
      registry.register(mockPlugin2);

      const types = registry.getAllTypes();
      expect(types).toHaveLength(2);
      expect(types).toContain('mock-plugin');
      expect(types).toContain('mock-plugin-2');
    });
  });

  describe('clear()', () => {
    it('should remove all registered plugins', () => {
      registry.register(mockPlugin);
      expect(registry.size()).toBe(1);

      registry.clear();
      expect(registry.size()).toBe(0);
      expect(registry.getAll()).toEqual([]);
    });
  });

  describe('size()', () => {
    it('should return 0 when no plugins registered', () => {
      expect(registry.size()).toBe(0);
    });

    it('should return correct count of registered plugins', () => {
      const mockPlugin2 = new MockPlugin();
      Object.defineProperty(mockPlugin2, 'type', { value: 'mock-plugin-2' });

      registry.register(mockPlugin);
      expect(registry.size()).toBe(1);

      registry.register(mockPlugin2);
      expect(registry.size()).toBe(2);

      registry.unregister('mock-plugin');
      expect(registry.size()).toBe(1);
    });
  });
});
