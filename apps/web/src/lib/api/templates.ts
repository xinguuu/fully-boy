import { apiClient } from './client';
import type { Game } from '@xingu/shared';

export interface TemplateListResponse {
  templates: Game[];
  total: number;
}

export const templatesApi = {
  getTemplates: async (): Promise<TemplateListResponse> => {
    return apiClient.get<TemplateListResponse>('/api/templates');
  },

  getTemplate: async (id: string): Promise<Game> => {
    return apiClient.get<Game>(`/api/templates/${id}`);
  },
};
