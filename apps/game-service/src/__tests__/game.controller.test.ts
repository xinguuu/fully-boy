import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { GameController } from '../controllers/game.controller';
import { gameService } from '../services/game.service';
import { UnauthorizedError } from '../middleware/error.middleware';

vi.mock('../services/game.service');

describe('GameController', () => {
  let gameController: GameController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    gameController = new GameController();
    jsonMock = vi.fn();
    sendMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({
      json: jsonMock,
      send: sendMock,
    });

    mockResponse = {
      status: statusMock,
    } as Partial<Response>;

    vi.clearAllMocks();
  });

  describe('getMyGames', () => {
    it('should return all games for authenticated user', async () => {
      const mockGames = [
        { id: 'game-1', title: 'Test Game 1' },
        { id: 'game-2', title: 'Test Game 2' },
      ];

      mockRequest = {
        user: { id: 'user-123', email: 'test@example.com' },
      } as Partial<Request>;

      vi.mocked(gameService.getMyGames).mockResolvedValue(mockGames as any);

      await gameController.getMyGames(mockRequest as Request, mockResponse as Response);

      expect(gameService.getMyGames).toHaveBeenCalledWith('user-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockGames);
    });

    it('should throw UnauthorizedError if user not authenticated', async () => {
      mockRequest = {} as Partial<Request>;

      await expect(
        gameController.getMyGames(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('getGameById', () => {
    it('should return game by id', async () => {
      const mockGame = {
        id: 'game-123',
        title: 'Test Game',
        userId: 'user-123',
      };

      mockRequest = {
        user: { id: 'user-123', email: 'test@example.com' },
        params: { id: 'game-123' },
      } as Partial<Request>;

      vi.mocked(gameService.getGameById).mockResolvedValue(mockGame as any);

      await gameController.getGameById(mockRequest as Request, mockResponse as Response);

      expect(gameService.getGameById).toHaveBeenCalledWith('game-123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockGame);
    });

    it('should throw UnauthorizedError if user not authenticated', async () => {
      mockRequest = {
        params: { id: 'game-123' },
      } as Partial<Request>;

      await expect(
        gameController.getGameById(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('createGame', () => {
    it('should create a new game', async () => {
      const createDto = {
        title: 'New Game',
        description: 'Test description',
        gameType: 'QUIZ',
        settings: {},
        questions: [],
      };

      const mockCreatedGame = {
        id: 'new-game-id',
        ...createDto,
        userId: 'user-123',
      };

      mockRequest = {
        user: { id: 'user-123', email: 'test@example.com' },
        body: createDto,
      } as Partial<Request>;

      vi.mocked(gameService.createGame).mockResolvedValue(mockCreatedGame as any);

      await gameController.createGame(mockRequest as Request, mockResponse as Response);

      expect(gameService.createGame).toHaveBeenCalledWith('user-123', createDto);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockCreatedGame);
    });

    it('should throw UnauthorizedError if user not authenticated', async () => {
      mockRequest = {
        body: { title: 'Test' },
      } as Partial<Request>;

      await expect(
        gameController.createGame(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('updateGame', () => {
    it('should update an existing game', async () => {
      const updateDto = {
        title: 'Updated Title',
      };

      const mockUpdatedGame = {
        id: 'game-123',
        title: 'Updated Title',
        userId: 'user-123',
      };

      mockRequest = {
        user: { id: 'user-123', email: 'test@example.com' },
        params: { id: 'game-123' },
        body: updateDto,
      } as Partial<Request>;

      vi.mocked(gameService.updateGame).mockResolvedValue(mockUpdatedGame as any);

      await gameController.updateGame(mockRequest as Request, mockResponse as Response);

      expect(gameService.updateGame).toHaveBeenCalledWith('game-123', 'user-123', updateDto);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockUpdatedGame);
    });

    it('should throw UnauthorizedError if user not authenticated', async () => {
      mockRequest = {
        params: { id: 'game-123' },
        body: { title: 'Test' },
      } as Partial<Request>;

      await expect(
        gameController.updateGame(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('deleteGame', () => {
    it('should delete a game', async () => {
      mockRequest = {
        user: { id: 'user-123', email: 'test@example.com' },
        params: { id: 'game-123' },
      } as Partial<Request>;

      vi.mocked(gameService.deleteGame).mockResolvedValue(undefined);

      await gameController.deleteGame(mockRequest as Request, mockResponse as Response);

      expect(gameService.deleteGame).toHaveBeenCalledWith('game-123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should throw UnauthorizedError if user not authenticated', async () => {
      mockRequest = {
        params: { id: 'game-123' },
      } as Partial<Request>;

      await expect(
        gameController.deleteGame(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
