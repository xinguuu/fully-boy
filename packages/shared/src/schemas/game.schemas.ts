import { z } from 'zod';
import { GameType, Category } from '../types';

// ==========================================
// Media Settings Schema
// ==========================================

const cropAreaSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(0).max(100),
  height: z.number().min(0).max(100),
});

const maskTypeSchema = z.enum(['none', 'blur', 'mosaic', 'spotlight']);

const imageMediaSettingsSchema = z.object({
  data: z.string().optional(), // Base64 (temporary)
  cropArea: cropAreaSchema.optional(),
  maskType: maskTypeSchema.optional(),
  maskIntensity: z.number().min(0).max(100).optional(),
});

const audioMediaSettingsSchema = z.object({
  data: z.string().optional(), // Base64 (temporary)
  startTime: z.number().min(0).optional(),
  endTime: z.number().min(0).optional(),
});

const videoMediaSettingsSchema = z.object({
  data: z.string().optional(), // Base64 (temporary)
  startTime: z.number().min(0).optional(),
  endTime: z.number().min(0).optional(),
  cropArea: cropAreaSchema.optional(),
});

const mediaSettingsSchema = z.object({
  image: imageMediaSettingsSchema.optional(),
  audio: audioMediaSettingsSchema.optional(),
  video: videoMediaSettingsSchema.optional(),
});

// ==========================================
// Game Schemas
// ==========================================

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
    pointsPerCorrect: z.number().int().min(1).max(1000).optional().default(100),
    timeBonusEnabled: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
  }),
  sessionSettings: z.record(z.unknown()).optional(),
  questions: z
    .array(
      z.object({
        order: z.number().int().min(0),
        content: z.string().min(1).max(500),
        imageUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        audioUrl: z.string().url().optional(),
        mediaSettings: mediaSettingsSchema.optional(),
        data: z.record(z.any()),
      })
    )
    .min(1)
    .max(100),
  sourceGameId: z.string().cuid().optional(),
});

export const updateGameSchema = createGameSchema
  .partial()
  .omit({ templateId: true })
  .extend({
    settings: z.object({
      timeLimit: z.number().int().min(5).max(300).optional(),
      pointsPerCorrect: z.number().int().min(1).max(1000).optional(),
      timeBonusEnabled: z.boolean().optional(),
      soundEnabled: z.boolean().optional(),
    }).optional(),
    questions: z
      .array(
        z.object({
          id: z.string().cuid().optional(), // Allow id for existing questions
          order: z.number().int().min(0),
          content: z.string().min(1).max(500),
          imageUrl: z.string().url().optional(),
          videoUrl: z.string().url().optional(),
          audioUrl: z.string().url().optional(),
          mediaSettings: mediaSettingsSchema.optional(),
          data: z.record(z.any()),
        })
      )
      .optional(),
  });

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
