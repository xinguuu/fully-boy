import { randomUUID } from 'crypto';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { NotFoundError, ConflictError } from '../middleware/error.middleware';
import { REDIS_KEYS, REDIS_TTL } from '@xingu/shared';
import type {
  CreateRoomDto,
  RoomResponse,
  JoinRoomDto,
  Participant,
  ParticipantSession,
  JoinRoomResponse,
} from '../types/room.types';

export class RoomService {
  private generatePIN(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async isPINUnique(pin: string): Promise<boolean> {
    const existingRoom = await prisma.room.findUnique({
      where: { pin },
    });
    return !existingRoom;
  }

  private async generateUniquePIN(): Promise<string> {
    let pin: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      pin = this.generatePIN();
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error('Failed to generate unique PIN after multiple attempts');
      }
    } while (!(await this.isPINUnique(pin)));

    return pin;
  }

  async createRoom(dto: CreateRoomDto): Promise<RoomResponse> {
    const { gameId, organizerId, expiresInMinutes = REDIS_TTL.DEFAULT_ROOM_EXPIRATION_MINUTES } = dto;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundError('Game not found');
    }

    const pin = await this.generateUniquePIN();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    const room = await prisma.room.create({
      data: {
        pin,
        gameId,
        organizerId,
        status: 'WAITING',
        expiresAt,
      },
    });

    return {
      id: room.id,
      pin: room.pin,
      gameId: room.gameId,
      organizerId: room.organizerId,
      status: room.status,
      createdAt: room.createdAt,
      expiresAt: room.expiresAt,
      participantCount: 0,
    };
  }

  async getRoomByPIN(pin: string): Promise<RoomResponse> {
    const room = await prisma.room.findUnique({
      where: { pin },
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (new Date() > room.expiresAt) {
      throw new ConflictError('Room has expired');
    }

    const participants = await this.getParticipants(pin);

    return {
      id: room.id,
      pin: room.pin,
      gameId: room.gameId,
      organizerId: room.organizerId,
      status: room.status,
      createdAt: room.createdAt,
      expiresAt: room.expiresAt,
      participantCount: participants.length,
    };
  }

  async joinRoom(pin: string, dto: JoinRoomDto): Promise<JoinRoomResponse> {
    const room = await this.getRoomByPIN(pin);

    if (room.status !== 'WAITING') {
      throw new ConflictError('Room is not accepting participants');
    }

    const participants = await this.getParticipants(pin);
    const existingParticipant = participants.find((p) => p.deviceId === dto.deviceId);

    if (existingParticipant) {
      throw new ConflictError('Device already joined this room');
    }

    const sessionId = randomUUID();

    const participant: Participant = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nickname: dto.nickname,
      deviceId: dto.deviceId,
      joinedAt: new Date(),
    };

    const participantSession: ParticipantSession = {
      sessionId,
      roomPin: pin,
      nickname: dto.nickname,
      deviceId: dto.deviceId,
      joinedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      score: 0,
    };

    const participantKey = REDIS_KEYS.ROOM_PARTICIPANTS(pin);
    await redis.lpush(participantKey, JSON.stringify(participant));
    await redis.expire(participantKey, REDIS_TTL.PARTICIPANT_SESSION);

    const sessionKey = REDIS_KEYS.PARTICIPANT_SESSION(sessionId);
    await redis.setex(sessionKey, REDIS_TTL.PARTICIPANT_SESSION, JSON.stringify(participantSession));

    return {
      sessionId,
      nickname: dto.nickname,
      deviceId: dto.deviceId,
      participant,
    };
  }

  async getParticipants(pin: string): Promise<Participant[]> {
    const key = REDIS_KEYS.ROOM_PARTICIPANTS(pin);
    const data = await redis.lrange(key, 0, -1);

    return data.map((item) => JSON.parse(item));
  }

  async getSession(sessionId: string): Promise<ParticipantSession | null> {
    const key = REDIS_KEYS.PARTICIPANT_SESSION(sessionId);
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  async updateSessionProgress(
    sessionId: string,
    questionIndex: number,
    score: number
  ): Promise<void> {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new NotFoundError('Session not found or expired');
    }

    const updatedSession: ParticipantSession = {
      ...session,
      currentQuestionIndex: questionIndex,
      score,
    };

    const key = REDIS_KEYS.PARTICIPANT_SESSION(sessionId);
    await redis.setex(key, REDIS_TTL.PARTICIPANT_SESSION, JSON.stringify(updatedSession));
  }

  async deleteRoom(pin: string, organizerId: string): Promise<void> {
    const room = await prisma.room.findUnique({
      where: { pin },
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (room.organizerId !== organizerId) {
      throw new ConflictError('Only the organizer can delete the room');
    }

    await redis.del(REDIS_KEYS.ROOM_PARTICIPANTS(pin));

    await prisma.room.delete({
      where: { pin },
    });
  }
}

export const roomService = new RoomService();
