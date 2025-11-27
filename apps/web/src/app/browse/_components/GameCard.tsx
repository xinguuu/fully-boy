'use client';

import { Star, Users, Clock, Smartphone, Zap, BarChart3 } from 'lucide-react';
import type { Game } from '@xingu/shared';
import { getGameTypeLabel } from '../_lib/constants';

export interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  isMyGame?: boolean;
  rank?: number;
  onCreateRoom: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: () => void;
  isDeleting?: boolean;
}

export function GameCard({
  game,
  isFavorite,
  isMyGame,
  rank,
  onCreateRoom,
  onToggleFavorite,
  onDelete,
  onViewHistory,
  isDeleting,
}: GameCardProps) {
  const gradientClass =
    game.gameCategory === 'PARTY'
      ? 'from-blue-400 via-secondary-400 to-purple-400'
      : 'from-orange-400 via-primary-400 to-red-400';

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 h-full flex flex-col border border-gray-200 hover:border-primary-300">
      {/* Thumbnail with Gradient */}
      <div className="relative h-40 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

        {/* Split Badge */}
        <div className="absolute top-3 left-3">
          <div className="inline-flex items-center overflow-hidden rounded-full shadow-lg">
            <span
              className={`px-3 py-1 text-xs font-bold ${
                game.gameCategory === 'PARTY'
                  ? 'bg-secondary-500 text-white'
                  : 'bg-primary-500 text-white'
              }`}
            >
              {game.gameCategory === 'PARTY' ? '🎉 파티' : '📝 퀴즈'}
            </span>
            <div className="w-px h-full bg-white/30"></div>
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-900">
              {getGameTypeLabel(game.gameType)}
            </span>
          </div>
        </div>

        {/* Rank Badge - Top 3 */}
        {rank && rank <= 3 && (
          <div className="absolute top-3 right-14 z-20">
            <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              {rank === 1 && '👑 1위'}
              {rank === 2 && '🔥 2위'}
              {rank === 3 && '⭐ 3위'}
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id, isFavorite);
          }}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all cursor-pointer shadow-lg"
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
            }`}
          />
        </button>

        {/* Game Icon/Emoji - Centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-90 group-hover:scale-110 transition-transform">
            {game.gameCategory === 'PARTY' ? '🎉' : '🎮'}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-500 transition-colors line-clamp-1">
          {game.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
          {game.description || '게임 설명이 없습니다'}
        </p>

        {/* needsMobile Badge */}
        <div className="mb-3">
          {game.needsMobile ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
              <Smartphone className="w-3 h-3" />
              핸드폰 필요
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-md border border-amber-200">
              <Zap className="w-3 h-3" />
              화면만 필요
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {game.maxPlayers || 30}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {game.duration || 10}분
          </span>
          <span className="flex items-center gap-1 font-semibold text-primary-600">
            🎮 {game.playCount || 0}회
          </span>
        </div>

        {/* Main Action Button */}
        <button
          onClick={() => onCreateRoom(game.id)}
          className={`w-full font-semibold py-2.5 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer ${
            game.gameCategory === 'PARTY'
              ? 'bg-gradient-to-r from-secondary-500 to-blue-600 hover:from-secondary-600 hover:to-blue-700 text-white'
              : 'bg-gradient-to-r from-primary-500 to-orange-600 hover:from-primary-600 hover:to-orange-700 text-white'
          }`}
        >
          {isMyGame ? '게임 편집' : '지금 시작하기 →'}
        </button>

        {/* My Games Only Actions */}
        {isMyGame && (
          <div className="flex gap-2 mt-2">
            {onViewHistory && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewHistory();
                }}
                className="flex-1 flex items-center justify-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium py-2 rounded-lg hover:bg-primary-50 border border-primary-200 transition-colors cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                기록
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(game.id);
                }}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-1 text-sm text-error hover:text-error-dark font-medium py-2 rounded-lg hover:bg-error-light border border-error/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? '삭제 중...' : '🗑️ 삭제'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
