import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../middleware/error.middleware';
import type { CreateResultDto, ResultResponse } from '../types/result.types';

export class ResultService {
  async createResult(dto: CreateResultDto): Promise<ResultResponse> {
    const { roomId, participantCount, duration, averageScore, leaderboard, questionStats } = dto;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    // Use transaction to atomically create result and increment playCount
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create game result
      const gameResult = await tx.gameResult.create({
        data: {
          roomId,
          participantCount,
          duration,
          averageScore,
          leaderboard: leaderboard as unknown as Prisma.InputJsonValue,
          questionStats: questionStats as unknown as Prisma.InputJsonValue,
        },
      });

      // 2. Get game details to check for sourceGameId
      const game = await tx.game.findUnique({
        where: { id: room.gameId },
        select: { id: true, sourceGameId: true, isPublic: true },
      });

      if (!game) {
        throw new NotFoundError('Game not found');
      }

      // 3. Increment playCount for the played game
      await tx.game.update({
        where: { id: room.gameId },
        data: {
          playCount: {
            increment: 1,
          },
        },
      });

      // 4. If this game was copied from a template, increment source template's playCount too
      if (game.sourceGameId) {
        const sourceGame = await tx.game.findUnique({
          where: { id: game.sourceGameId },
          select: { id: true, isPublic: true },
        });

        // Only increment if source is a public template
        if (sourceGame?.isPublic) {
          await tx.game.update({
            where: { id: game.sourceGameId },
            data: {
              playCount: {
                increment: 1,
              },
            },
          });
        }
      }

      return gameResult;
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
