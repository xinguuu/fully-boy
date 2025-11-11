import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomService } from '../services/room.service';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { NotFoundError, ConflictError } from '../middleware/error.middleware';

describe('RoomService', () => {
  let roomService: RoomService;

  beforeEach(() => {
    roomService = new RoomService();
    vi.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should create a room with unique PIN', async () => {
      const createDto = {
        gameId: 'game-123',
        organizerId: 'user-123',
        expiresInMinutes: 120,
      };

      const mockGame = {
        id: 'game-123',
        title: 'Test Game',
      };

      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'WAITING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 120 * 60 * 1000),
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any);
      vi.mocked(prisma.room.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.room.create).mockResolvedValue(mockRoom as any);

      const result = await roomService.createRoom(createDto);

      expect(prisma.game.findUnique).toHaveBeenCalledWith({
        where: { id: 'game-123' },
      });
      expect(prisma.room.create).toHaveBeenCalled();
      expect(result.pin).toMatch(/^\d{6}$/);
      expect(result.gameId).toBe('game-123');
      expect(result.organizerId).toBe('user-123');
    });

    it('should throw NotFoundError if game does not exist', async () => {
      const createDto = {
        gameId: 'nonexistent-game',
        organizerId: 'user-123',
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

      await expect(roomService.createRoom(createDto)).rejects.toThrow(NotFoundError);
    });

    it('should use default expiration time if not provided', async () => {
      const createDto = {
        gameId: 'game-123',
        organizerId: 'user-123',
      };

      const mockGame = {
        id: 'game-123',
        title: 'Test Game',
      };

      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'WAITING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 120 * 60 * 1000),
      };

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any);
      vi.mocked(prisma.room.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.room.create).mockResolvedValue(mockRoom as any);

      const result = await roomService.createRoom(createDto);

      expect(result).toBeDefined();
    });
  });

  describe('getRoomByPIN', () => {
    it('should return room details with participant count', async () => {
      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'WAITING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      const mockParticipants = [
        JSON.stringify({
          id: 'p1',
          nickname: 'Player 1',
          deviceId: 'device-1',
          joinedAt: new Date(),
        }),
      ];

      vi.mocked(prisma.room.findUnique).mockResolvedValue(mockRoom as any);
      vi.mocked(redis.lrange).mockResolvedValue(mockParticipants as any);

      const result = await roomService.getRoomByPIN('123456');

      expect(result.pin).toBe('123456');
      expect(result.participantCount).toBe(1);
    });

    it('should throw NotFoundError if room does not exist', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValue(null);

      await expect(roomService.getRoomByPIN('999999')).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if room has expired', async () => {
      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'WAITING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 60 * 60 * 1000),
      };

      vi.mocked(prisma.room.findUnique).mockResolvedValue(mockRoom as any);

      await expect(roomService.getRoomByPIN('123456')).rejects.toThrow(ConflictError);
    });
  });

  describe('joinRoom', () => {
    it('should allow participant to join waiting room', async () => {
      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'WAITING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      const joinDto = {
        nickname: 'Player 1',
        deviceId: 'device-123',
      };

      vi.mocked(prisma.room.findUnique).mockResolvedValue(mockRoom as any);
      vi.mocked(redis.lrange).mockResolvedValue([]);
      vi.mocked(redis.lpush).mockResolvedValue(1);
      vi.mocked(redis.expire).mockResolvedValue(1);

      const result = await roomService.joinRoom('123456', joinDto);

      expect(result.nickname).toBe('Player 1');
      expect(result.deviceId).toBe('device-123');
      expect(redis.lpush).toHaveBeenCalled();
      expect(redis.expire).toHaveBeenCalled();
    });

    it('should throw ConflictError if room is not waiting', async () => {
      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'IN_PROGRESS',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      const joinDto = {
        nickname: 'Player 1',
        deviceId: 'device-123',
      };

      vi.mocked(prisma.room.findUnique).mockResolvedValue(mockRoom as any);
      vi.mocked(redis.lrange).mockResolvedValue([]);

      await expect(roomService.joinRoom('123456', joinDto)).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if device already joined', async () => {
      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'WAITING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      const existingParticipant = [
        JSON.stringify({
          id: 'p1',
          nickname: 'Player 1',
          deviceId: 'device-123',
          joinedAt: new Date(),
        }),
      ];

      const joinDto = {
        nickname: 'Player 2',
        deviceId: 'device-123',
      };

      vi.mocked(prisma.room.findUnique).mockResolvedValue(mockRoom as any);
      vi.mocked(redis.lrange).mockResolvedValue(existingParticipant as any);

      await expect(roomService.joinRoom('123456', joinDto)).rejects.toThrow(ConflictError);
    });
  });

  describe('getParticipants', () => {
    it('should return list of participants', async () => {
      const mockParticipants = [
        JSON.stringify({
          id: 'p1',
          nickname: 'Player 1',
          deviceId: 'device-1',
          joinedAt: new Date(),
        }),
        JSON.stringify({
          id: 'p2',
          nickname: 'Player 2',
          deviceId: 'device-2',
          joinedAt: new Date(),
        }),
      ];

      vi.mocked(redis.lrange).mockResolvedValue(mockParticipants as any);

      const result = await roomService.getParticipants('123456');

      expect(result).toHaveLength(2);
      expect(result[0].nickname).toBe('Player 1');
      expect(result[1].nickname).toBe('Player 2');
    });

    it('should return empty array if no participants', async () => {
      vi.mocked(redis.lrange).mockResolvedValue([]);

      const result = await roomService.getParticipants('123456');

      expect(result).toEqual([]);
    });
  });

  describe('deleteRoom', () => {
    it('should delete room if organizer requests', async () => {
      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'WAITING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      vi.mocked(prisma.room.findUnique).mockResolvedValue(mockRoom as any);
      vi.mocked(prisma.room.delete).mockResolvedValue(mockRoom as any);
      vi.mocked(redis.del).mockResolvedValue(1);

      await roomService.deleteRoom('123456', 'user-123');

      expect(redis.del).toHaveBeenCalledWith('room:participants:123456');
      expect(prisma.room.delete).toHaveBeenCalledWith({
        where: { pin: '123456' },
      });
    });

    it('should throw NotFoundError if room does not exist', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValue(null);

      await expect(roomService.deleteRoom('999999', 'user-123')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw ConflictError if non-organizer tries to delete', async () => {
      const mockRoom = {
        id: 'room-123',
        pin: '123456',
        gameId: 'game-123',
        organizerId: 'user-123',
        status: 'WAITING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      vi.mocked(prisma.room.findUnique).mockResolvedValue(mockRoom as any);

      await expect(roomService.deleteRoom('123456', 'other-user')).rejects.toThrow(
        ConflictError,
      );
    });
  });
});
