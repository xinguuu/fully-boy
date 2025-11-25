import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../middleware/error.middleware';
import { logger } from '@xingu/shared/logger';
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

    // 5. Invalidate template cache (for Browse page updates)
    // Clear all template list caches using SCAN (non-blocking)
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          'MATCH',
          'templates:list:*',
          'COUNT',
          100
        );

        if (keys.length > 0) {
          await redis.del(...keys);
        }

        cursor = nextCursor;
      } while (cursor !== '0');
    } catch (error) {
      // Log but don't fail the request if cache invalidation fails
      logger.error('Failed to invalidate template cache', { error });
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

  async getResultsByGameId(
    gameId: string,
    limit = 10
  ): Promise<{ results: ResultResponse[]; total: number }> {
    // Get total count of results for this game
    const total = await prisma.room.count({
      where: {
        gameId,
        result: {
          isNot: null,
        },
      },
    });

    // Get paginated results
    const rooms = await prisma.room.findMany({
      where: { gameId },
      include: {
        result: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const results = rooms
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

    return { results, total };
  }
}

export const resultService = new ResultService();
