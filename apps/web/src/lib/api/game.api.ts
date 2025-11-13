import type { Game, Question } from '@xingu/shared';
import { gameClient } from './client';

export interface CreateGameData {
  title: string;
  description?: string;
  templateId?: string;
  questions: Omit<Question, 'id' | 'gameId' | 'createdAt' | 'updatedAt'>[];
  settings?: {
    timeLimit?: number;
    showLeaderboard?: boolean;
    allowLateJoin?: boolean;
  };
}

export interface UpdateGameData extends Partial<CreateGameData> {
  isPublic?: boolean;
}

export const gameApi = {
  list: async (): Promise<Game[]> => {
    return gameClient.get<Game[]>('/my-games');
  },

  getById: async (id: string): Promise<Game> => {
    return gameClient.get<Game>(`/${id}`);
  },

  create: async (data: CreateGameData): Promise<Game> => {
    return gameClient.post<Game>('/', data);
  },

  update: async (id: string, data: UpdateGameData): Promise<Game> => {
    return gameClient.put<Game>(`/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return gameClient.delete<void>(`/${id}`);
  },
};
