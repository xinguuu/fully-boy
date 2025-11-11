import { prisma } from '../config/database';
import { CreateGameDto, UpdateGameDto, GetTemplatesQuery } from '../dto/game.dto';
import { GameType, Prisma } from '@prisma/client';

export class GameService {
  async getTemplates(query: GetTemplatesQuery) {
    const { gameType, category, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      isPublic: true,
      userId: null,
      ...(gameType && { gameType }),
      ...(category && { category }),
    };

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
        skip,
        take: limit,
        orderBy: { playCount: 'desc' },
      }),
      prisma.game.count({ where }),
    ]);

    return {
      data: games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTemplatesByType(gameType: GameType) {
    return prisma.game.findMany({
      where: {
        isPublic: true,
        userId: null,
        gameType,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { playCount: 'desc' },
    });
  }

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

  async createGame(userId: string, dto: CreateGameDto) {
    const { questions, sourceGameId, ...gameData } = dto;

    if (sourceGameId) {
      const sourceGame = await prisma.game.findUnique({
        where: { id: sourceGameId },
      });

      if (!sourceGame) {
        throw new Error('Source game not found');
      }

      if (!sourceGame.isPublic && sourceGame.userId !== userId) {
        throw new Error('Cannot duplicate private game');
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
      throw new Error('Game not found');
    }

    if (game.userId !== userId) {
      throw new Error('Unauthorized to update this game');
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

  async deleteGame(gameId: string, userId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.userId !== userId) {
      throw new Error('Unauthorized to delete this game');
    }

    await prisma.game.delete({
      where: { id: gameId },
    });
  }
}

export const gameService = new GameService();
