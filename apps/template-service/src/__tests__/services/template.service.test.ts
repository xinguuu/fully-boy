import { describe, it, expect, vi, beforeEach } from 'vitest';
import { templateService } from '../../services/template.service';
import { redis } from '../../config/redis';
import { PrismaClient } from '@prisma/client';

vi.mock('../../config/redis');
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    game: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockPrismaClient),
    GameType: {
      OX_QUIZ: 'OX_QUIZ',
      BALANCE_GAME: 'BALANCE_GAME',
      INITIAL_QUIZ: 'INITIAL_QUIZ',
      FOUR_CHOICE_QUIZ: 'FOUR_CHOICE_QUIZ',
      SPEED_QUIZ: 'SPEED_QUIZ',
    },
    Category: {
      ICE_BREAKING: 'ICE_BREAKING',
      QUIZ: 'QUIZ',
      MUSIC: 'MUSIC',
      VOTE: 'VOTE',
      ENTERTAINMENT: 'ENTERTAINMENT',
      MEME: 'MEME',
    },
  };
});

const prisma = new PrismaClient();

describe('TemplateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTemplates', () => {
    it('should return cached data if available', async () => {
      const cachedData = {
        templates: [],
        total: 0,
        limit: 20,
        offset: 0,
      };

      vi.mocked(redis.get).mockResolvedValue(JSON.stringify(cachedData));

      const result = await templateService.getTemplates({});

      expect(result).toEqual(cachedData);
      expect(redis.get).toHaveBeenCalledOnce();
      expect(prisma.game.findMany).not.toHaveBeenCalled();
    });

    it('should fetch from database if cache miss', async () => {
      const mockTemplates = [
        {
          id: '1',
          title: 'Test Template',
          description: 'Test Description',
          thumbnail: null,
          gameType: 'OX_QUIZ',
          category: 'QUIZ',
          duration: 10,
          minPlayers: 5,
          maxPlayers: 100,
          needsMobile: true,
          playCount: 10,
          favoriteCount: 5,
          createdAt: new Date(),
          _count: { questions: 3 },
        },
      ];

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(prisma.game.findMany).mockResolvedValue(mockTemplates);
      vi.mocked(prisma.game.count).mockResolvedValue(1);
      vi.mocked(redis.setex).mockResolvedValue('OK');

      const result = await templateService.getTemplates({});

      expect(result.templates).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prisma.game.findMany).toHaveBeenCalledOnce();
      expect(redis.setex).toHaveBeenCalledOnce();
    });

    it('should filter by gameType', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(prisma.game.findMany).mockResolvedValue([]);
      vi.mocked(prisma.game.count).mockResolvedValue(0);
      vi.mocked(redis.setex).mockResolvedValue('OK');

      await templateService.getTemplates({ gameType: 'OX_QUIZ' as any });

      expect(prisma.game.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublic: true,
            gameType: 'OX_QUIZ',
          }),
        })
      );
    });

    it('should apply pagination', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(prisma.game.findMany).mockResolvedValue([]);
      vi.mocked(prisma.game.count).mockResolvedValue(0);
      vi.mocked(redis.setex).mockResolvedValue('OK');

      await templateService.getTemplates({ limit: 10, offset: 5 });

      expect(prisma.game.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 10,
        })
      );
    });
  });

  describe('getTemplateById', () => {
    it('should return cached template if available', async () => {
      const cachedTemplate = {
        id: '1',
        title: 'Test Template',
        questions: [],
      };

      vi.mocked(redis.get).mockResolvedValue(JSON.stringify(cachedTemplate));

      const result = await templateService.getTemplateById('1');

      expect(result).toEqual(cachedTemplate);
      expect(redis.get).toHaveBeenCalledOnce();
      expect(prisma.game.findFirst).not.toHaveBeenCalled();
    });

    it('should fetch from database if cache miss', async () => {
      const mockTemplate = {
        id: '1',
        title: 'Test Template',
        description: 'Test',
        thumbnail: null,
        gameType: 'OX_QUIZ',
        category: 'QUIZ',
        duration: 10,
        minPlayers: 5,
        maxPlayers: 100,
        needsMobile: true,
        playCount: 10,
        favoriteCount: 5,
        settings: {},
        createdAt: new Date(),
        questions: [],
        _count: { questions: 0 },
      };

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(prisma.game.findFirst).mockResolvedValue(mockTemplate);
      vi.mocked(redis.setex).mockResolvedValue('OK');

      const result = await templateService.getTemplateById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(prisma.game.findFirst).toHaveBeenCalledOnce();
      expect(redis.setex).toHaveBeenCalledOnce();
    });

    it('should return null if template not found and cache the not-found result', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(prisma.game.findFirst).mockResolvedValue(null);
      vi.mocked(redis.setex).mockResolvedValue('OK');

      const result = await templateService.getTemplateById('999');

      expect(result).toBeNull();
      // Null caching: cache "not found" result to prevent cache penetration
      expect(redis.setex).toHaveBeenCalledWith(
        'templates:detail:999',
        300, // NULL_CACHE TTL (5 minutes)
        JSON.stringify({ notFound: true })
      );
    });

    it('should return null from cached not-found result', async () => {
      // Cached "not found" result
      vi.mocked(redis.get).mockResolvedValue(JSON.stringify({ notFound: true }));

      const result = await templateService.getTemplateById('999');

      expect(result).toBeNull();
      expect(prisma.game.findFirst).not.toHaveBeenCalled(); // DB not queried
    });
  });

  describe('invalidateCache', () => {
    it('should delete specific template cache', async () => {
      vi.mocked(redis.del).mockResolvedValue(1);
      // Mock redis.scan to return empty result (cursor '0' means done)
      vi.mocked(redis.scan).mockResolvedValue(['0', []]);

      await templateService.invalidateCache('1');

      expect(redis.del).toHaveBeenCalledWith('templates:detail:1');
    });

    it('should delete all list caches using SCAN', async () => {
      const listKeys = ['templates:list:1', 'templates:list:2'];
      vi.mocked(redis.del).mockResolvedValue(2);
      // Mock redis.scan: first call returns keys, second call returns empty (done)
      vi.mocked(redis.scan)
        .mockResolvedValueOnce(['0', listKeys]);

      await templateService.invalidateCache('1');

      expect(redis.scan).toHaveBeenCalledWith('0', 'MATCH', 'templates:list:*', 'COUNT', 100);
      expect(redis.del).toHaveBeenCalledWith(...listKeys);
    });
  });
});
