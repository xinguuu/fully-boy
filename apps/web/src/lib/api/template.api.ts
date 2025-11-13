import type { Game } from '@xingu/shared';
import { templateClient } from './client';

export interface TemplateListParams {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
  sort?: 'popular' | 'newest' | 'title';
}

export interface TemplateListResponse {
  templates: Game[];
  total: number;
  page: number;
  limit: number;
}

export const templateApi = {
  list: async (params?: TemplateListParams): Promise<TemplateListResponse> => {
    return templateClient.get<TemplateListResponse>('/', { params });
  },

  getById: async (id: string): Promise<Game> => {
    return templateClient.get<Game>(`/${id}`);
  },
};
