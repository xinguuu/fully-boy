import { apiClient } from './client';
import type { Game } from '@xingu/shared';

export interface CreateGameRequest {
  title: string;
  description?: string;
  emoji?: string;
  questions: Array<{
    type: string;
    text: string;
    options?: string[];
    correctAnswer: string;
    timeLimit: number;
    points: number;
  }>;
  tags?: string[];
}

export interface UpdateGameRequest extends Partial<CreateGameRequest> {}

export const gamesApi = {
  getMyGames: async (): Promise<Game[]> => {
    return apiClient.get<Game[]>('/api/games/my-games');
  },

  getGame: async (id: string): Promise<Game> => {
    return apiClient.get<Game>(`/api/games/${id}`);
  },

  createGame: async (data: CreateGameRequest): Promise<Game> => {
    return apiClient.post<Game>('/api/games', data);
  },

  updateGame: async (id: string, data: UpdateGameRequest): Promise<Game> => {
    return apiClient.put<Game>(`/api/games/${id}`, data);
  },

  deleteGame: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/games/${id}`);
  },
};
