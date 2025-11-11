import { z } from 'zod';
import { GameType, Category } from '../types';

export const createGameSchema = z.object({
  templateId: z.string().cuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  gameType: z.nativeEnum(GameType),
  category: z.nativeEnum(Category),
  duration: z.number().int().min(5).max(120),
  minPlayers: z.number().int().min(1).max(1000),
  maxPlayers: z.number().int().min(1).max(1000),
  needsMobile: z.boolean(),
  settings: z.object({
    timeLimit: z.number().int().min(5).max(300).optional(),
    pointsPerCorrect: z.number().int().min(1).max(1000),
    timeBonusEnabled: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
  }),
  questions: z
    .array(
      z.object({
        order: z.number().int().min(1),
        content: z.string().min(1).max(500),
        imageUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        audioUrl: z.string().url().optional(),
        data: z.record(z.any()),
      })
    )
    .min(1)
    .max(100),
});

export const updateGameSchema = createGameSchema.partial().omit({ templateId: true });

export const getTemplatesQuerySchema = z.object({
  needsMobile: z.enum(['true', 'false', 'all']).optional().default('all'),
  category: z
    .enum([
      'ICE_BREAKING',
      'QUIZ',
      'MUSIC',
      'VOTE',
      'ENTERTAINMENT',
      'MEME',
      'all',
    ])
    .optional()
    .default('all'),
  duration: z.enum(['5', '10', '30', '60', 'all']).optional().default('all'),
  minPlayers: z.enum(['5', '10', '30', 'all']).optional().default('all'),
  sort: z.enum(['popularity', 'newest', 'name']).optional().default('popularity'),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('20'),
});

export type CreateGameDto = z.infer<typeof createGameSchema>;
export type UpdateGameDto = z.infer<typeof updateGameSchema>;
export type GetTemplatesQuery = z.infer<typeof getTemplatesQuerySchema>;
