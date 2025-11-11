import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { RoomController } from '../controllers/room.controller';
import { roomService } from '../services/room.service';
import { UnauthorizedError, ValidationError } from '../middleware/error.middleware';

vi.mock('../services/room.service');

describe('RoomController', () => {
  let roomController: RoomController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    roomController = new RoomController();
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

  describe('createRoom', () => {
    it('should create a room for authenticated user', async () => {
      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'WAITING',
        createdAt: new Date(),
        expiresAt: new Date(),
        participantCount: 0,
      };

      mockRequest = {
        user: { id: 'user-123', email: 'test@example.com' },
        body: {
          gameId: 'game-123',
          expiresInMinutes: 120,
        },
      } as Partial<Request>;

      vi.mocked(roomService.createRoom).mockResolvedValue(mockRoom);

      await roomController.createRoom(mockRequest as Request, mockResponse as Response);

      expect(roomService.createRoom).toHaveBeenCalledWith({
        gameId: 'game-123',
        expiresInMinutes: 120,
        organizerId: 'user-123',
      });
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockRoom);
    });

    it('should throw UnauthorizedError if user not authenticated', async () => {
      mockRequest = {
        body: { gameId: 'game-123' },
      } as Partial<Request>;

      await expect(
        roomController.createRoom(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('getRoomByPIN', () => {
    it('should return room details', async () => {
      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'WAITING',
        createdAt: new Date(),
        expiresAt: new Date(),
        participantCount: 5,
      };

      mockRequest = {
        params: { pin: '123456' },
      } as Partial<Request>;

      vi.mocked(roomService.getRoomByPIN).mockResolvedValue(mockRoom);

      await roomController.getRoomByPIN(mockRequest as Request, mockResponse as Response);

      expect(roomService.getRoomByPIN).toHaveBeenCalledWith('123456');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockRoom);
    });

    it('should throw ValidationError if PIN is invalid', async () => {
      mockRequest = {
        params: { pin: '12345' },
      } as Partial<Request>;

      await expect(
        roomController.getRoomByPIN(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if PIN is missing', async () => {
      mockRequest = {
        params: {},
      } as Partial<Request>;

      await expect(
        roomController.getRoomByPIN(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('joinRoom', () => {
    it('should allow participant to join room', async () => {
      const mockParticipant = {
        id: 'p1',
        nickname: 'Player 1',
        deviceId: 'device-123',
        joinedAt: new Date(),
      };

      mockRequest = {
        params: { pin: '123456' },
        body: {
          nickname: 'Player 1',
          deviceId: 'device-123',
        },
      } as Partial<Request>;

      vi.mocked(roomService.joinRoom).mockResolvedValue(mockParticipant);

      await roomController.joinRoom(mockRequest as Request, mockResponse as Response);

      expect(roomService.joinRoom).toHaveBeenCalledWith('123456', {
        nickname: 'Player 1',
        deviceId: 'device-123',
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockParticipant);
    });

    it('should throw ValidationError if PIN is invalid', async () => {
      mockRequest = {
        params: { pin: '12345' },
        body: { nickname: 'Player 1', deviceId: 'device-123' },
      } as Partial<Request>;

      await expect(
        roomController.joinRoom(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if nickname is missing', async () => {
      mockRequest = {
        params: { pin: '123456' },
        body: { deviceId: 'device-123' },
      } as Partial<Request>;

      await expect(
        roomController.joinRoom(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if deviceId is missing', async () => {
      mockRequest = {
        params: { pin: '123456' },
        body: { nickname: 'Player 1' },
      } as Partial<Request>;

      await expect(
        roomController.joinRoom(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getParticipants', () => {
    it('should return list of participants', async () => {
      const mockParticipants = [
        {
          id: 'p1',
          nickname: 'Player 1',
          deviceId: 'device-1',
          joinedAt: new Date(),
        },
        {
          id: 'p2',
          nickname: 'Player 2',
          deviceId: 'device-2',
          joinedAt: new Date(),
        },
      ];

      mockRequest = {
        params: { pin: '123456' },
      } as Partial<Request>;

      vi.mocked(roomService.getParticipants).mockResolvedValue(mockParticipants);

      await roomController.getParticipants(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(roomService.getParticipants).toHaveBeenCalledWith('123456');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockParticipants);
    });

    it('should throw ValidationError if PIN is invalid', async () => {
      mockRequest = {
        params: { pin: '12345' },
      } as Partial<Request>;

      await expect(
        roomController.getParticipants(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteRoom', () => {
    it('should delete room if organizer requests', async () => {
      mockRequest = {
        user: { id: 'user-123', email: 'test@example.com' },
        params: { pin: '123456' },
      } as Partial<Request>;

      vi.mocked(roomService.deleteRoom).mockResolvedValue(undefined);

      await roomController.deleteRoom(mockRequest as Request, mockResponse as Response);

      expect(roomService.deleteRoom).toHaveBeenCalledWith('123456', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should throw UnauthorizedError if user not authenticated', async () => {
      mockRequest = {
        params: { pin: '123456' },
      } as Partial<Request>;

      await expect(
        roomController.deleteRoom(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ValidationError if PIN is invalid', async () => {
      mockRequest = {
        user: { id: 'user-123', email: 'test@example.com' },
        params: { pin: '12345' },
      } as Partial<Request>;

      await expect(
        roomController.deleteRoom(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ValidationError);
    });
  });
});
