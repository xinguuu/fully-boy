export enum GameType {
  OX_QUIZ = 'OX_QUIZ',
  BALANCE_GAME = 'BALANCE_GAME',
  INITIAL_QUIZ = 'INITIAL_QUIZ',
  FOUR_CHOICE_QUIZ = 'FOUR_CHOICE_QUIZ',
  SPEED_QUIZ = 'SPEED_QUIZ',
  LIAR_GAME = 'LIAR_GAME',
}

export enum Category {
  ICE_BREAKING = 'ICE_BREAKING',
  QUIZ = 'QUIZ',
  MUSIC = 'MUSIC',
  VOTE = 'VOTE',
  ENTERTAINMENT = 'ENTERTAINMENT',
  MEME = 'MEME',
}

export enum TemplateCategory {
  QUIZ = 'QUIZ',
  PARTY = 'PARTY',
}

export interface Game {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  gameType: GameType;
  category: Category;
  gameCategory: TemplateCategory;
  isPublic: boolean;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  needsMobile: boolean;
  playCount: number;
  favoriteCount: number;
  questionCount?: number;
  isFavorite?: boolean;
  settings: Record<string, unknown>;
  sessionSettings?: Record<string, unknown>;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  gameId: string;
  order: number;
  content: string;
  data: Record<string, unknown>;
  imageUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Question Data Types (Plugin-specific)
// ==========================================

/**
 * Re-export plugin-specific question data types for convenience
 */
export type {
  MultipleChoiceQuestionData,
} from '../plugins/game-types/multiple-choice.plugin';
export type { TrueFalseQuestionData } from '../plugins/game-types/true-false.plugin';
export type { ShortAnswerQuestionData } from '../plugins/game-types/short-answer.plugin';
export type {
  LiarGameSessionData,
  LiarGamePhase,
  LiarGameActionType,
} from '../plugins/game-types/liar-game.plugin';

/**
 * Union type of all question data types
 */
export type AnyQuestionData =
  | import('../plugins/game-types/multiple-choice.plugin').MultipleChoiceQuestionData
  | import('../plugins/game-types/true-false.plugin').TrueFalseQuestionData
  | import('../plugins/game-types/short-answer.plugin').ShortAnswerQuestionData;

// ==========================================
// DTO Types (from Zod schemas)
// ==========================================

/**
 * Re-export DTO types inferred from Zod schemas
 * These are used for API requests/responses
 */
export type {
  CreateGameDto,
  UpdateGameDto,
  GetTemplatesQuery,
} from '../schemas/game.schemas';

// ==========================================
// API Request/Response Types
// ==========================================

/**
 * Question input for create/update operations
 */
export interface QuestionInput {
  id?: string;
  order: number;
  content: string;
  data: AnyQuestionData;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

/**
 * Game with questions (full details)
 */
export interface GameWithQuestions extends Game {
  questions: Question[];
}

/**
 * Template list response
 */
export interface TemplateListResponse {
  templates: Game[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Game list response (my games)
 */
export interface GameListResponse {
  games: Game[];
  total: number;
}
