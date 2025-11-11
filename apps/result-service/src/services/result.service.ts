import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError } from '../middleware/error.middleware';
import type { CreateResultDto, ResultResponse } from '../types/result.types';

const prisma = new PrismaClient();

export class ResultService {
  async createResult(dto: CreateResultDto): Promise<ResultResponse> {
    const { roomId, participantCount, duration, averageScore, leaderboard, questionStats } = dto;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const result = await prisma.gameResult.create({
      data: {
        roomId,
        participantCount,
        duration,
        averageScore,
        leaderboard: leaderboard as unknown as Prisma.InputJsonValue,
        questionStats: questionStats as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      id: result.id,
      roomId: result.roomId,
      participantCount: result.participantCount,
      duration: result.duration,
      averageScore: result.averageScore,
      leaderboard: result.leaderboard as any,
      questionStats: result.questionStats as any,
      createdAt: result.createdAt,
    };
  }

  async getResultByRoomId(roomId: string): Promise<ResultResponse> {
    const result = await prisma.gameResult.findUnique({
      where: { roomId },
    });

    if (!result) {
      throw new NotFoundError('Result not found');
    }

    return {
      id: result.id,
      roomId: result.roomId,
      participantCount: result.participantCount,
      duration: result.duration,
      averageScore: result.averageScore,
      leaderboard: result.leaderboard as any,
      questionStats: result.questionStats as any,
      createdAt: result.createdAt,
    };
  }

  async getResultsByGameId(gameId: string, limit = 10): Promise<ResultResponse[]> {
    const rooms = await prisma.room.findMany({
      where: { gameId },
      include: {
        result: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return rooms
      .filter((room) => room.result !== null)
      .map((room) => ({
        id: room.result!.id,
        roomId: room.result!.roomId,
        participantCount: room.result!.participantCount,
        duration: room.result!.duration,
        averageScore: room.result!.averageScore,
        leaderboard: room.result!.leaderboard as any,
        questionStats: room.result!.questionStats as any,
        createdAt: room.result!.createdAt,
      }));
  }
}

export const resultService = new ResultService();
