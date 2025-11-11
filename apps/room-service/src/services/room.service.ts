import { PrismaClient } from '@prisma/client';
import { redis } from '../config/redis';
import { NotFoundError, ConflictError } from '../middleware/error.middleware';
import type { CreateRoomDto, RoomResponse, JoinRoomDto, Participant } from '../types/room.types';

const prisma = new PrismaClient();

const REDIS_PARTICIPANT_PREFIX = 'room:participants:';
const REDIS_PARTICIPANT_TTL = 7200;

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
    const { gameId, organizerId, expiresInMinutes = 120 } = dto;

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

  async joinRoom(pin: string, dto: JoinRoomDto): Promise<Participant> {
    const room = await this.getRoomByPIN(pin);

    if (room.status !== 'WAITING') {
      throw new ConflictError('Room is not accepting participants');
    }

    const participants = await this.getParticipants(pin);
    const existingParticipant = participants.find((p) => p.deviceId === dto.deviceId);

    if (existingParticipant) {
      throw new ConflictError('Device already joined this room');
    }

    const participant: Participant = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nickname: dto.nickname,
      deviceId: dto.deviceId,
      joinedAt: new Date(),
    };

    const key = `${REDIS_PARTICIPANT_PREFIX}${pin}`;
    await redis.lpush(key, JSON.stringify(participant));
    await redis.expire(key, REDIS_PARTICIPANT_TTL);

    return participant;
  }

  async getParticipants(pin: string): Promise<Participant[]> {
    const key = `${REDIS_PARTICIPANT_PREFIX}${pin}`;
    const data = await redis.lrange(key, 0, -1);

    return data.map((item) => JSON.parse(item));
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

    await redis.del(`${REDIS_PARTICIPANT_PREFIX}${pin}`);

    await prisma.room.delete({
      where: { pin },
    });
  }
}

export const roomService = new RoomService();
