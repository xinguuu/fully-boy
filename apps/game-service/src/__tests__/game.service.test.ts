import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from '../services/game.service';
import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../middleware/error.middleware';

describe('GameService', () => {
  let gameService: GameService;
  const mockUserId = 'user-123';
  const mockGameId = 'game-456';

  beforeEach(() => {
    gameService = new GameService();
    vi.clearAllMocks();
  });

  describe('getMyGames', () => {
    it('should return all games for a user', async () => {
      const mockGames = [
        {
          id: 'game-1',
          userId: mockUserId,
          title: 'Test Game 1',
          questions: [],
        },
        {
          id: 'game-2',
          userId: mockUserId,
          title: 'Test Game 2',
          questions: [],
        },
      ];

      vi.mocked(prisma.game.findMany).mockResolvedValue(mockGames as any);

      const result = await gameService.getMyGames(mockUserId);

      expect(prisma.game.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(mockGames);
    });

    it('should return empty array if user has no games', async () => {
      vi.mocked(prisma.game.findMany).mockResolvedValue([]);

      const result = await gameService.getMyGames(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getGameById', () => {
    it('should return game if user owns it', async () => {
      const mockGame = {
        id: mockGameId,
        userId: mockUserId,
        title: 'Test Game',
        questions: [],
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any);

      const result = await gameService.getGameById(mockGameId, mockUserId);

      expect(result).toEqual(mockGame);
    });

    it('should throw NotFoundError if game does not exist', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

      await expect(gameService.getGameById(mockGameId, mockUserId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw ForbiddenError if user does not own game', async () => {
      const mockGame = {
        id: mockGameId,
        userId: 'other-user',
        title: 'Test Game',
        questions: [],
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any);

      await expect(gameService.getGameById(mockGameId, mockUserId)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe('createGame', () => {
    it('should create a new game', async () => {
      const createDto = {
        title: 'New Game',
        description: 'Test description',
        gameType: 'QUIZ' as const,
        settings: {},
        questions: [
          {
            type: 'MULTIPLE_CHOICE' as const,
            question: 'Test Question',
            order: 0,
            timeLimit: 30,
            points: 1000,
            data: { choices: ['A', 'B', 'C', 'D'], correctAnswer: 0 },
          },
        ],
      };

      const mockCreatedGame = {
        id: 'new-game-id',
        userId: mockUserId,
        ...createDto,
        questions: createDto.questions,
      };

      vi.mocked(prisma.game.create).mockResolvedValue(mockCreatedGame as any);

      const result = await gameService.createGame(mockUserId, createDto);

      expect(prisma.game.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedGame);
    });

    it('should duplicate game from source if sourceGameId provided', async () => {
      const createDto = {
        title: 'Duplicated Game',
        description: 'Test description',
        gameType: 'QUIZ' as const,
        settings: {},
        sourceGameId: 'source-game-id',
        questions: [],
      };

      const mockSourceGame = {
        id: 'source-game-id',
        userId: mockUserId,
        isPublic: true,
      };

      const mockCreatedGame = {
        id: 'new-game-id',
        userId: mockUserId,
        title: createDto.title,
        questions: [],
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockSourceGame as any);
      vi.mocked(prisma.game.create).mockResolvedValue(mockCreatedGame as any);

      const result = await gameService.createGame(mockUserId, createDto);

      expect(prisma.game.findUnique).toHaveBeenCalledWith({
        where: { id: 'source-game-id' },
      });
      expect(result).toEqual(mockCreatedGame);
    });

    it('should throw NotFoundError if source game does not exist', async () => {
      const createDto = {
        title: 'Duplicated Game',
        description: 'Test description',
        gameType: 'QUIZ' as const,
        settings: {},
        sourceGameId: 'nonexistent-game',
        questions: [],
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

      await expect(gameService.createGame(mockUserId, createDto)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw ForbiddenError if source game is private and not owned', async () => {
      const createDto = {
        title: 'Duplicated Game',
        description: 'Test description',
        gameType: 'QUIZ' as const,
        settings: {},
        sourceGameId: 'private-game-id',
        questions: [],
      };

      const mockSourceGame = {
        id: 'private-game-id',
        userId: 'other-user',
        isPublic: false,
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockSourceGame as any);

      await expect(gameService.createGame(mockUserId, createDto)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe('updateGame', () => {
    it('should update game if user owns it', async () => {
      const updateDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const mockGame = {
        id: mockGameId,
        userId: mockUserId,
      };

      const mockUpdatedGame = {
        ...mockGame,
        ...updateDto,
        questions: [],
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any);
      vi.mocked(prisma.game.update).mockResolvedValue(mockUpdatedGame as any);

      const result = await gameService.updateGame(mockGameId, mockUserId, updateDto);

      expect(result.title).toBe(updateDto.title);
    });

    it('should throw NotFoundError if game does not exist', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

      await expect(
        gameService.updateGame(mockGameId, mockUserId, { title: 'Test' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if user does not own game', async () => {
      const mockGame = {
        id: mockGameId,
        userId: 'other-user',
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any);

      await expect(
        gameService.updateGame(mockGameId, mockUserId, { title: 'Test' }),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should update questions if provided', async () => {
      const updateDto = {
        title: 'Updated Title',
        questions: [
          {
            type: 'MULTIPLE_CHOICE' as const,
            question: 'Updated Question',
            order: 0,
            timeLimit: 30,
            points: 1000,
            data: { choices: ['A', 'B'], correctAnswer: 0 },
          },
        ],
      };

      const mockGame = {
        id: mockGameId,
        userId: mockUserId,
      };

      const mockUpdatedGame = {
        ...mockGame,
        ...updateDto,
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any);
      vi.mocked(prisma.question.deleteMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.game.update).mockResolvedValue(mockUpdatedGame as any);

      const result = await gameService.updateGame(mockGameId, mockUserId, updateDto);

      expect(prisma.question.deleteMany).toHaveBeenCalledWith({
        where: { gameId: mockGameId },
      });
      expect(result).toEqual(mockUpdatedGame);
    });
  });

  describe('deleteGame', () => {
    it('should delete game if user owns it', async () => {
      const mockGame = {
        id: mockGameId,
        userId: mockUserId,
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any);
      vi.mocked(prisma.game.delete).mockResolvedValue(mockGame as any);

      await gameService.deleteGame(mockGameId, mockUserId);

      expect(prisma.game.delete).toHaveBeenCalledWith({
        where: { id: mockGameId },
      });
    });

    it('should throw NotFoundError if game does not exist', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

      await expect(gameService.deleteGame(mockGameId, mockUserId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw ForbiddenError if user does not own game', async () => {
      const mockGame = {
        id: mockGameId,
        userId: 'other-user',
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any);

      await expect(gameService.deleteGame(mockGameId, mockUserId)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });
});
