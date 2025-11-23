import type { GameType, Category, TemplateCategory } from '@prisma/client';

export interface TemplateListItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  gameType: GameType;
  category: Category;
  gameCategory: TemplateCategory;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  needsMobile: boolean;
  playCount: number;
  favoriteCount: number;
  questionCount: number;
  isFavorite?: boolean;
  createdAt: Date;
}

export interface TemplateDetail extends TemplateListItem {
  settings: unknown;
  sessionSettings?: unknown;
  questions: TemplateQuestion[];
}

export interface TemplateQuestion {
  id: string;
  order: number;
  content: string;
  data: unknown;
  imageUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
}

export interface TemplateListQuery {
  gameType?: GameType;
  category?: Category;
  gameCategory?: TemplateCategory;
  limit?: number;
  offset?: number;
  sortBy?: 'playCount' | 'favoriteCount' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface TemplateListResponse {
  templates: TemplateListItem[];
  total: number;
  limit: number;
  offset: number;
}
