import { prisma } from '../config/database';
import { CreateGameDto, UpdateGameDto } from '../dto/game.dto';
import { Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../middleware/error.middleware';

export class GameService {
  async getMyGames(userId: string) {
    const games = await prisma.game.findMany({
      where: { userId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        favorites: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return games.map((game) => {
      const { favorites, ...rest } = game;
      return {
        ...rest,
        questionCount: game._count.questions,
        isFavorite: favorites.length > 0,
      };
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
    const { questions, sourceGameId, sessionSettings, ...gameData } = dto;

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
        ...(sessionSettings && { sessionSettings: sessionSettings as Prisma.InputJsonValue }),
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
    // Fetch game with existing questions
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { questions: true },
    });

    if (!game) {
      throw new NotFoundError('Game not found');
    }

    if (game.userId !== userId) {
      throw new ForbiddenError('You do not have permission to update this game');
    }

    const { questions, settings, sessionSettings, ...gameData } = dto;

    // If questions are being updated, use upsert pattern
    if (questions) {
      const existingQuestions = game.questions;
      const existingIds = new Set(existingQuestions.map((q) => q.id));
      const incomingIds = new Set(questions.filter((q) => q.id).map((q) => q.id!));

      // 1. Questions to delete (exist in DB but not in incoming)
      const toDelete = existingQuestions
        .filter((q) => !incomingIds.has(q.id))
        .map((q) => q.id);

      // 2. Questions to create (no ID)
      const toCreate = questions.filter((q) => !q.id);

      // 3. Questions to update (have ID and exist in DB)
      const toUpdate = questions.filter((q) => q.id && existingIds.has(q.id));

      // Execute in transaction for atomicity
      return await prisma.$transaction(async (tx) => {
        // Delete removed questions
        if (toDelete.length > 0) {
          await tx.question.deleteMany({
            where: { id: { in: toDelete } },
          });
        }

        // Create new questions
        if (toCreate.length > 0) {
          await tx.question.createMany({
            data: toCreate.map((q) => ({
              gameId,
              order: q.order,
              content: q.content,
              data: q.data as Prisma.InputJsonValue,
              imageUrl: q.imageUrl,
              videoUrl: q.videoUrl,
              audioUrl: q.audioUrl,
            })),
          });
        }

        // Update existing questions
        for (const q of toUpdate) {
          await tx.question.update({
            where: { id: q.id },
            data: {
              order: q.order,
              content: q.content,
              data: q.data as Prisma.InputJsonValue,
              imageUrl: q.imageUrl,
              videoUrl: q.videoUrl,
              audioUrl: q.audioUrl,
            },
          });
        }

        // Update game metadata
        return tx.game.update({
          where: { id: gameId },
          data: {
            ...gameData,
            ...(settings && { settings: settings as Prisma.InputJsonValue }),
            ...(sessionSettings && { sessionSettings: sessionSettings as Prisma.InputJsonValue }),
          },
          include: {
            questions: { orderBy: { order: 'asc' } },
          },
        });
      });
    }

    // If no questions update, just update game metadata
    return prisma.game.update({
      where: { id: gameId },
      data: {
        ...gameData,
        ...(settings && { settings: settings as Prisma.InputJsonValue }),
        ...(sessionSettings && { sessionSettings: sessionSettings as Prisma.InputJsonValue }),
      },
      include: {
        questions: { orderBy: { order: 'asc' } },
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

  async addFavorite(userId: string, gameId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundError('Game not found');
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (existingFavorite) {
      return existingFavorite;
    }

    const [favorite] = await prisma.$transaction([
      prisma.favorite.create({
        data: {
          userId,
          gameId,
        },
      }),
      prisma.game.update({
        where: { id: gameId },
        data: {
          favoriteCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return favorite;
  }

  async removeFavorite(userId: string, gameId: string): Promise<void> {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundError('Favorite not found');
    }

    await prisma.$transaction([
      prisma.favorite.delete({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      }),
      prisma.game.update({
        where: { id: gameId },
        data: {
          favoriteCount: {
            decrement: 1,
          },
        },
      }),
    ]);
  }

  async getFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => fav.game);
  }

  async getFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { gameId: true },
    });

    return favorites.map((fav) => fav.gameId);
  }
}

export const gameService = new GameService();
