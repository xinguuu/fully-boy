import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResultService } from '../services/result.service';
import { prisma } from '../config/database';
import { NotFoundError } from '../middleware/error.middleware';

describe('ResultService', () => {
  let resultService: ResultService;

  beforeEach(() => {
    resultService = new ResultService();
    vi.clearAllMocks();
  });

  describe('createResult', () => {
    it('should create a game result', async () => {
      const createDto = {
        roomId: 'room-123',
        participantCount: 10,
        duration: 600,
        averageScore: 7500,
        leaderboard: [
          { rank: 1, nickname: 'Player 1', score: 9500 },
          { rank: 2, nickname: 'Player 2', score: 8500 },
        ],
        questionStats: [
          { questionId: 'q1', correctRate: 0.8 },
          { questionId: 'q2', correctRate: 0.6 },
        ],
      };

      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
      };

      const mockResult = {
        id: 'result-123',
        roomId: 'room-123',
        participantCount: 10,
        duration: 600,
        averageScore: 7500,
        leaderboard: createDto.leaderboard,
        questionStats: createDto.questionStats,
        createdAt: new Date(),
      };

      vi.mocked(prisma.room.findUnique).mockResolvedValue(mockRoom as any);
      vi.mocked(prisma.gameResult.create).mockResolvedValue(mockResult as any);

      const result = await resultService.createResult(createDto);

      expect(prisma.room.findUnique).toHaveBeenCalledWith({
        where: { id: 'room-123' },
      });
      expect(prisma.gameResult.create).toHaveBeenCalled();
      expect(result.id).toBe('result-123');
      expect(result.participantCount).toBe(10);
      expect(result.averageScore).toBe(7500);
    });

    it('should throw NotFoundError if room does not exist', async () => {
      const createDto = {
        roomId: 'nonexistent-room',
        participantCount: 10,
        duration: 600,
        averageScore: 7500,
        leaderboard: [],
        questionStats: [],
      };

      vi.mocked(prisma.room.findUnique).mockResolvedValue(null);

      await expect(resultService.createResult(createDto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getResultByRoomId', () => {
    it('should return result by room ID', async () => {
      const mockResult = {
        id: 'result-123',
        roomId: 'room-123',
        participantCount: 10,
        duration: 600,
        averageScore: 7500,
        leaderboard: [{ rank: 1, nickname: 'Player 1', score: 9500 }],
        questionStats: [{ questionId: 'q1', correctRate: 0.8 }],
        createdAt: new Date(),
      };

      vi.mocked(prisma.gameResult.findUnique).mockResolvedValue(mockResult as any);

      const result = await resultService.getResultByRoomId('room-123');

      expect(prisma.gameResult.findUnique).toHaveBeenCalledWith({
        where: { roomId: 'room-123' },
      });
      expect(result.roomId).toBe('room-123');
      expect(result.participantCount).toBe(10);
    });

    it('should throw NotFoundError if result does not exist', async () => {
      vi.mocked(prisma.gameResult.findUnique).mockResolvedValue(null);

      await expect(resultService.getResultByRoomId('nonexistent-room')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('getResultsByGameId', () => {
    it('should return results for a game', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          gameId: 'game-123',
          createdAt: new Date(),
          result: {
            id: 'result-1',
            roomId: 'room-1',
            participantCount: 10,
            duration: 600,
            averageScore: 7500,
            leaderboard: [],
            questionStats: [],
            createdAt: new Date(),
          },
        },
        {
          id: 'room-2',
          gameId: 'game-123',
          createdAt: new Date(),
          result: {
            id: 'result-2',
            roomId: 'room-2',
            participantCount: 8,
            duration: 500,
            averageScore: 6500,
            leaderboard: [],
            questionStats: [],
            createdAt: new Date(),
          },
        },
      ];

      vi.mocked(prisma.room.findMany).mockResolvedValue(mockRooms as any);

      const results = await resultService.getResultsByGameId('game-123');

      expect(prisma.room.findMany).toHaveBeenCalledWith({
        where: { gameId: 'game-123' },
        include: {
          result: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(results).toHaveLength(2);
      expect(results[0].participantCount).toBe(10);
      expect(results[1].participantCount).toBe(8);
    });

    it('should filter out rooms without results', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          gameId: 'game-123',
          createdAt: new Date(),
          result: {
            id: 'result-1',
            roomId: 'room-1',
            participantCount: 10,
            duration: 600,
            averageScore: 7500,
            leaderboard: [],
            questionStats: [],
            createdAt: new Date(),
          },
        },
        {
          id: 'room-2',
          gameId: 'game-123',
          createdAt: new Date(),
          result: null,
        },
      ];

      vi.mocked(prisma.room.findMany).mockResolvedValue(mockRooms as any);

      const results = await resultService.getResultsByGameId('game-123');

      expect(results).toHaveLength(1);
      expect(results[0].participantCount).toBe(10);
    });

    it('should respect limit parameter', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          gameId: 'game-123',
          createdAt: new Date(),
          result: {
            id: 'result-1',
            roomId: 'room-1',
            participantCount: 10,
            duration: 600,
            averageScore: 7500,
            leaderboard: [],
            questionStats: [],
            createdAt: new Date(),
          },
        },
      ];

      vi.mocked(prisma.room.findMany).mockResolvedValue(mockRooms as any);

      await resultService.getResultsByGameId('game-123', 5);

      expect(prisma.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        }),
      );
    });

    it('should return empty array if no results found', async () => {
      vi.mocked(prisma.room.findMany).mockResolvedValue([]);

      const results = await resultService.getResultsByGameId('game-123');

      expect(results).toEqual([]);
    });
  });
});
