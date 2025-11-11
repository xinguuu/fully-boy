import { PrismaClient } from '@prisma/client';
import { redis } from '../config/redis';
import type {
  TemplateListItem,
  TemplateDetail,
  TemplateListQuery,
  TemplateListResponse,
} from '../types/template.types';

const prisma = new PrismaClient();

const CACHE_TTL = 3600;
const CACHE_PREFIX = {
  LIST: 'templates:list',
  DETAIL: 'templates:detail',
};

export class TemplateService {
  async getTemplates(query: TemplateListQuery): Promise<TemplateListResponse> {
    const {
      gameType,
      category,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const cacheKey = `${CACHE_PREFIX.LIST}:${JSON.stringify(query)}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const where = {
      isPublic: true,
      ...(gameType && { gameType }),
      ...(category && { category }),
    };

    const [templates, total] = await Promise.all([
      prisma.game.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          gameType: true,
          category: true,
          duration: true,
          minPlayers: true,
          maxPlayers: true,
          needsMobile: true,
          playCount: true,
          favoriteCount: true,
          createdAt: true,
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { [sortBy]: order },
        skip: offset,
        take: limit,
      }),
      prisma.game.count({ where }),
    ]);

    const result: TemplateListResponse = {
      templates: templates.map((template) => ({
        ...template,
        questionCount: template._count.questions,
      })) as TemplateListItem[],
      total,
      limit,
      offset,
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
  }

  async getTemplateById(id: string): Promise<TemplateDetail | null> {
    const cacheKey = `${CACHE_PREFIX.DETAIL}:${id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const template = await prisma.game.findFirst({
      where: {
        id,
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        gameType: true,
        category: true,
        duration: true,
        minPlayers: true,
        maxPlayers: true,
        needsMobile: true,
        playCount: true,
        favoriteCount: true,
        settings: true,
        createdAt: true,
        questions: {
          select: {
            id: true,
            order: true,
            content: true,
            data: true,
            imageUrl: true,
            videoUrl: true,
            audioUrl: true,
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!template) {
      return null;
    }

    const result: TemplateDetail = {
      ...template,
      questionCount: template._count.questions,
    } as TemplateDetail;

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
  }

  async invalidateCache(id?: string): Promise<void> {
    if (id) {
      await redis.del(`${CACHE_PREFIX.DETAIL}:${id}`);
    }

    const listKeys = await redis.keys(`${CACHE_PREFIX.LIST}:*`);
    if (listKeys.length > 0) {
      await redis.del(...listKeys);
    }
  }
}

export const templateService = new TemplateService();
