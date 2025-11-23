import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { ResultController } from '../controllers/result.controller';
import { resultService } from '../services/result.service';
import { ValidationError } from '../middleware/error.middleware';

vi.mock('../services/result.service');

describe('ResultController', () => {
  let resultController: ResultController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    resultController = new ResultController();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({
      json: jsonMock,
    });

    mockResponse = {
      status: statusMock,
    } as Partial<Response>;

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
        ],
        questionStats: [
          { questionId: 'q1', correctRate: 0.8 },
        ],
      };

      const mockResult = {
        id: 'result-123',
        ...createDto,
        createdAt: new Date(),
      };

      mockRequest = {
        body: createDto,
      } as Partial<Request>;

      vi.mocked(resultService.createResult).mockResolvedValue(mockResult);

      await resultController.createResult(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(resultService.createResult).toHaveBeenCalledWith(createDto);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockResult);
    });

    it('should throw ValidationError if roomId is missing', async () => {
      mockRequest = {
        body: {
          participantCount: 10,
          leaderboard: [],
          questionStats: [],
        },
      } as Partial<Request>;

      await expect(
        resultController.createResult(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if participantCount is missing', async () => {
      mockRequest = {
        body: {
          roomId: 'room-123',
          leaderboard: [],
          questionStats: [],
        },
      } as Partial<Request>;

      await expect(
        resultController.createResult(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if leaderboard is missing', async () => {
      mockRequest = {
        body: {
          roomId: 'room-123',
          participantCount: 10,
          questionStats: [],
        },
      } as Partial<Request>;

      await expect(
        resultController.createResult(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if questionStats is missing', async () => {
      mockRequest = {
        body: {
          roomId: 'room-123',
          participantCount: 10,
          leaderboard: [],
        },
      } as Partial<Request>;

      await expect(
        resultController.createResult(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
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
        leaderboard: [],
        questionStats: [],
        createdAt: new Date(),
      };

      mockRequest = {
        params: { roomId: 'room-123' },
      } as Partial<Request>;

      vi.mocked(resultService.getResultByRoomId).mockResolvedValue(mockResult);

      await resultController.getResultByRoomId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(resultService.getResultByRoomId).toHaveBeenCalledWith('room-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockResult);
    });

    it('should throw ValidationError if roomId is missing', async () => {
      mockRequest = {
        params: {},
      } as Partial<Request>;

      await expect(
        resultController.getResultByRoomId(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getResultsByGameId', () => {
    it('should return results for a game with default limit', async () => {
      const mockResults = [
        {
          id: 'result-1',
          roomId: 'room-1',
          participantCount: 10,
          duration: 600,
          averageScore: 7500,
          leaderboard: [],
          questionStats: [],
          createdAt: new Date(),
        },
        {
          id: 'result-2',
          roomId: 'room-2',
          participantCount: 8,
          duration: 500,
          averageScore: 6500,
          leaderboard: [],
          questionStats: [],
          createdAt: new Date(),
        },
      ];

      mockRequest = {
        params: { gameId: 'game-123' },
        query: {},
      } as Partial<Request>;

      vi.mocked(resultService.getResultsByGameId).mockResolvedValue(mockResults);

      await resultController.getResultsByGameId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(resultService.getResultsByGameId).toHaveBeenCalledWith('game-123', 10);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        results: mockResults,
        total: mockResults.length,
      });
    });

    it('should return results for a game with custom limit', async () => {
      const mockResults = [
        {
          id: 'result-1',
          roomId: 'room-1',
          participantCount: 10,
          duration: 600,
          averageScore: 7500,
          leaderboard: [],
          questionStats: [],
          createdAt: new Date(),
        },
      ];

      mockRequest = {
        params: { gameId: 'game-123' },
        query: { limit: '5' },
      } as Partial<Request>;

      vi.mocked(resultService.getResultsByGameId).mockResolvedValue(mockResults);

      await resultController.getResultsByGameId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(resultService.getResultsByGameId).toHaveBeenCalledWith('game-123', 5);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        results: mockResults,
        total: mockResults.length,
      });
    });

    it('should throw ValidationError if gameId is missing', async () => {
      mockRequest = {
        params: {},
        query: {},
      } as Partial<Request>;

      await expect(
        resultController.getResultsByGameId(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if limit is less than 1', async () => {
      mockRequest = {
        params: { gameId: 'game-123' },
        query: { limit: '0' },
      } as Partial<Request>;

      await expect(
        resultController.getResultsByGameId(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if limit is greater than 100', async () => {
      mockRequest = {
        params: { gameId: 'game-123' },
        query: { limit: '101' },
      } as Partial<Request>;

      await expect(
        resultController.getResultsByGameId(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if limit is not a number', async () => {
      mockRequest = {
        params: { gameId: 'game-123' },
        query: { limit: 'abc' },
      } as Partial<Request>;

      await expect(
        resultController.getResultsByGameId(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(ValidationError);
    });
  });
});
