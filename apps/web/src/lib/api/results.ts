import { apiClient } from './client';
import type { GameResult, GameResultsResponse } from '@/types/result.types';

const RESULT_API_URL = process.env.NEXT_PUBLIC_API_RESULT_URL || 'http://localhost:3006/api/results';

export const resultsApi = {
  /**
   * Get all results for a specific game
   * @param gameId - Game ID
   * @param limit - Number of results to return (default: 10, max: 100)
   * @returns List of game results
   */
  async getGameResults(gameId: string, limit = 10): Promise<GameResultsResponse> {
    const response = await fetch(`${RESULT_API_URL}/game/${gameId}?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch game results');
    }

    return response.json();
  },

  /**
   * Get result for a specific room
   * @param roomId - Room ID (same as result ID in this case)
   * @returns Game result
   */
  async getResultByRoom(roomId: string): Promise<GameResult> {
    const response = await fetch(`${RESULT_API_URL}/room/${roomId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch result');
    }

    return response.json();
  },

  /**
   * Create a new game result (called by backend, not typically used by frontend)
   * @param data - Result data
   * @returns Created result
   */
  async createResult(data: Partial<GameResult>): Promise<GameResult> {
    return apiClient.post<GameResult>(`${RESULT_API_URL}`, data);
  },
};
