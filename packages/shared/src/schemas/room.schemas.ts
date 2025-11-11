import { z } from 'zod';

export const createRoomSchema = z.object({
  gameId: z.string().cuid(),
});

export const joinRoomSchema = z.object({
  pin: z.string().length(6).regex(/^\d{6}$/),
  nickname: z.string().min(1).max(20).trim(),
});

export const submitAnswerSchema = z.object({
  roomId: z.string().cuid(),
  questionIndex: z.number().int().min(0),
  answer: z.string(),
});

export const revealAnswerSchema = z.object({
  roomId: z.string().cuid(),
  questionIndex: z.number().int().min(0),
});

export const nextQuestionSchema = z.object({
  roomId: z.string().cuid(),
});

export const startGameSchema = z.object({
  roomId: z.string().cuid(),
});

export type CreateRoomDto = z.infer<typeof createRoomSchema>;
export type JoinRoomDto = z.infer<typeof joinRoomSchema>;
export type SubmitAnswerDto = z.infer<typeof submitAnswerSchema>;
export type RevealAnswerDto = z.infer<typeof revealAnswerSchema>;
export type NextQuestionDto = z.infer<typeof nextQuestionSchema>;
export type StartGameDto = z.infer<typeof startGameSchema>;
