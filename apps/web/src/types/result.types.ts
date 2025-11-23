/**
 * Game Result Types
 *
 * Types for game results and leaderboard data.
 * These types match the result-service API responses.
 */

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  score: number;
}

export interface GameResult {
  id: string;
  roomId: string;
  participantCount: number;
  duration: number; // seconds
  averageScore: number;
  leaderboard: LeaderboardEntry[];
  questionStats: Record<string, unknown>; // Currently empty in backend
  createdAt: string;

  // Optional fields for enriched responses
  room?: {
    id: string;
    pin: string;
    gameId: string;
    game?: {
      id: string;
      title: string;
      gameType: string;
      gameCategory: string;
    };
  };
}

export interface GameResultsResponse {
  results: GameResult[];
  total: number;
}

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "15분 32초", "1시간 5분 10초")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 ${secs}초`;
  }

  if (minutes > 0) {
    return `${minutes}분 ${secs}초`;
  }

  return `${secs}초`;
}

/**
 * Format date to Korean format
 * @param dateString - ISO date string
 * @returns Formatted string (e.g., "2025-11-23 14:30")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Get relative time string (e.g., "1시간 전", "3일 전")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(dateString);
  }

  if (days > 0) {
    return `${days}일 전`;
  }

  if (hours > 0) {
    return `${hours}시간 전`;
  }

  if (minutes > 0) {
    return `${minutes}분 전`;
  }

  return '방금 전';
}
