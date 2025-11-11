import { prisma } from '../config/database';
import { CreateGameDto, UpdateGameDto } from '../dto/game.dto';
import { Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../middleware/error.middleware';

export class GameService {
  async getMyGames(userId: string) {
    return prisma.game.findMany({
      where: { userId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getGameById(gameId: string, userId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!game) {
      throw new NotFoundError('Game not found');
    }

    if (game.userId !== userId) {
      throw new ForbiddenError('You do not have permission to access this game');
    }

    return game;
  }

  async createGame(userId: string, dto: CreateGameDto) {
    const { questions, sourceGameId, ...gameData } = dto;

    if (sourceGameId) {
      const sourceGame = await prisma.game.findUnique({
        where: { id: sourceGameId },
      });

      if (!sourceGame) {
        throw new NotFoundError('Source game not found');
      }

      if (!sourceGame.isPublic && sourceGame.userId !== userId) {
        throw new ForbiddenError('Cannot duplicate private game');
      }
    }

    const questionsData = questions.map((q) => ({
      ...q,
      data: q.data as Prisma.InputJsonValue,
    }));

    return prisma.game.create({
      data: {
        ...gameData,
        settings: gameData.settings as Prisma.InputJsonValue,
        userId,
        questions: {
          create: questionsData,
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async updateGame(gameId: string, userId: string, dto: UpdateGameDto) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundError('Game not found');
    }

    if (game.userId !== userId) {
      throw new ForbiddenError('You do not have permission to update this game');
    }

    const { questions, settings, ...gameData } = dto;

    const updateData: Prisma.GameUpdateInput = {
      ...gameData,
      ...(settings && { settings: settings as Prisma.InputJsonValue }),
    };

    if (questions) {
      await prisma.question.deleteMany({
        where: { gameId },
      });

      const questionsData = questions.map((q) => ({
        ...q,
        data: q.data as Prisma.InputJsonValue,
      }));

      return prisma.game.update({
        where: { id: gameId },
        data: {
          ...updateData,
          questions: {
            create: questionsData,
          },
        },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      });
    }

    return prisma.game.update({
      where: { id: gameId },
      data: updateData,
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async deleteGame(gameId: string, userId: string): Promise<void> {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundError('Game not found');
    }

    if (game.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this game');
    }

    await prisma.game.delete({
      where: { id: gameId },
    });
  }
}

export const gameService = new GameService();
