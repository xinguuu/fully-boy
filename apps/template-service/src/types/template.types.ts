import type { GameType, Category } from '@prisma/client';

export interface TemplateListItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  gameType: GameType;
  category: Category;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  needsMobile: boolean;
  playCount: number;
  favoriteCount: number;
  questionCount: number;
  createdAt: Date;
}

export interface TemplateDetail extends TemplateListItem {
  settings: unknown;
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
