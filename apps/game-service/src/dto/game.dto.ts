import { z } from 'zod';
import { GameType, Category, TemplateCategory } from '@prisma/client';

export const GetTemplatesQuerySchema = z.object({
  gameType: z.nativeEnum(GameType).optional(),
  category: z.nativeEnum(Category).optional(),
  gameCategory: z.nativeEnum(TemplateCategory).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

export const CreateGameDtoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  thumbnail: z.string().url().optional(),
  gameType: z.nativeEnum(GameType),
  category: z.nativeEnum(Category),
  gameCategory: z.nativeEnum(TemplateCategory).default('QUIZ'),
  isPublic: z.boolean().default(false),
  duration: z.number().int().positive(),
  minPlayers: z.number().int().positive().default(5),
  maxPlayers: z.number().int().positive().default(100),
  needsMobile: z.boolean(),
  settings: z.record(z.unknown()),
  sessionSettings: z.record(z.unknown()).optional(),
  questions: z.array(
    z.object({
      order: z.number().int().nonnegative(),
      content: z.string().min(1),
      data: z.record(z.unknown()),
      imageUrl: z.string().url().optional(),
      videoUrl: z.string().url().optional(),
      audioUrl: z.string().url().optional(),
    }),
  ),
  sourceGameId: z.string().optional(),
});

export const UpdateGameDtoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  thumbnail: z.string().url().optional(),
  category: z.nativeEnum(Category).optional(),
  gameCategory: z.nativeEnum(TemplateCategory).optional(),
  isPublic: z.boolean().optional(),
  duration: z.number().int().positive().optional(),
  minPlayers: z.number().int().positive().optional(),
  maxPlayers: z.number().int().positive().optional(),
  needsMobile: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
  sessionSettings: z.record(z.unknown()).optional(),
  questions: z
    .array(
      z.object({
        id: z.string().optional(),
        order: z.number().int().nonnegative(),
        content: z.string().min(1),
        data: z.record(z.unknown()),
        imageUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        audioUrl: z.string().url().optional(),
      }),
    )
    .optional(),
});

export type GetTemplatesQuery = z.infer<typeof GetTemplatesQuerySchema>;
export type CreateGameDto = z.infer<typeof CreateGameDtoSchema>;
export type UpdateGameDto = z.infer<typeof UpdateGameDtoSchema>;
