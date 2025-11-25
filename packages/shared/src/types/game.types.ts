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

// ==========================================
// Media Settings Types
// ==========================================

/**
 * Crop area for image/video (percentage-based, 0-100)
 */
export interface CropArea {
  x: number; // Left position (%)
  y: number; // Top position (%)
  width: number; // Width (%)
  height: number; // Height (%)
}

/**
 * Mask type for hiding parts of image
 * - none: No mask, show full image
 * - blur: Blur everything except crop area
 * - mosaic: Pixelate everything except crop area
 * - spotlight: Dark overlay with spotlight on crop area
 */
export type MaskType = 'none' | 'blur' | 'mosaic' | 'spotlight';

/**
 * Image media settings
 */
export interface ImageMediaSettings {
  data?: string; // Base64 data (temporary, will migrate to S3 URL)
  cropArea?: CropArea; // Area to show/highlight
  maskType?: MaskType; // How to hide the rest
  maskIntensity?: number; // 0-100, strength of blur/mosaic
}

/**
 * Audio media settings
 */
export interface AudioMediaSettings {
  data?: string; // Base64 data (temporary)
  startTime?: number; // Start time in seconds
  endTime?: number; // End time in seconds
}

/**
 * Video media settings
 */
export interface VideoMediaSettings {
  data?: string; // Base64 data (temporary)
  startTime?: number; // Start time in seconds
  endTime?: number; // End time in seconds
  cropArea?: CropArea; // Optional crop for video
}

/**
 * Combined media settings for a question
 */
export interface MediaSettings {
  image?: ImageMediaSettings;
  audio?: AudioMediaSettings;
  video?: VideoMediaSettings;
}

// ==========================================
// Question Types
// ==========================================

export interface Question {
  id: string;
  gameId: string;
  order: number;
  content: string;
  data: Record<string, unknown>;
  imageUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  mediaSettings?: MediaSettings | null;
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
  mediaSettings?: MediaSettings;
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
