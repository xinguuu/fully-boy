'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, ChevronDown, Star, Users, Clock, Eye } from 'lucide-react';
import { useTemplates, useGames, useCurrentUser } from '@/lib/hooks';
import type { Game } from '@xingu/shared';

export default function BrowsePage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: templatesResponse } = useTemplates();
  const { data: myGames = [] } = useGames();

  const [activeTab, setActiveTab] = useState<'browse' | 'myGames'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const templates = templatesResponse?.templates || [];
  const favoriteGames = myGames.filter((game) => favorites.has(game.id));

  const handleCreateRoom = (gameId: string) => {
    if (activeTab === 'myGames') {
      router.push(`/edit/${gameId}`);
    } else {
      router.push(`/edit/new?templateId=${gameId}`);
    }
  };

  const handlePreview = (templateId: string) => {
    console.log('Preview template:', templateId);
  };

  const toggleFavorite = (templateId: string) => {
    console.log('Toggle favorite:', templateId);
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId);
      } else {
        newFavorites.add(templateId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-primary-500 hover:text-primary-600 transition-colors cursor-pointer"
          >
            🎮 Xingu
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="게임 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none cursor-text"
              />
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.name || user?.email || '프로필'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 animate-slide-down">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors cursor-pointer">
                  내 정보
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors cursor-pointer">
                  설정
                </button>
                <div className="h-px bg-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    router.push('/');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error-light transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('browse')}
              className={`pb-3 px-1 border-b-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'browse'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              둘러보기
            </button>
            <button
              onClick={() => setActiveTab('myGames')}
              className={`pb-3 px-1 border-b-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'myGames'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              내 게임 ({myGames.length})
            </button>
          </nav>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">필터:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              📱 전체
            </button>
            <button
              onClick={() => setFilter('icebreaking')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                filter === 'icebreaking'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              🎉 아이스브레이킹
            </button>
            <button
              onClick={() => setFilter('time')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                filter === 'time'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ⏱️ 전체
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="popular">인기순</option>
              <option value="newest">최신순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        </div>

        {/* Browse Tab Content */}
        {activeTab === 'browse' && (
          <div>
            {/* Favorites Section */}
            {favoriteGames.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-4">⭐ 즐겨찾기 ({favoriteGames.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isFavorite={favorites.has(game.id)}
                      onCreateRoom={handleCreateRoom}
                      onPreview={handlePreview}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">전체 게임 ({templates.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <GameCard
                    key={template.id}
                    game={template}
                    isFavorite={favorites.has(template.id)}
                    onCreateRoom={handleCreateRoom}
                    onPreview={handlePreview}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Games Tab Content */}
        {activeTab === 'myGames' && (
          <div>
            {myGames.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">아직 만든 게임이 없습니다</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all hover:scale-105 cursor-pointer"
                >
                  게임 둘러보기
                </button>
              </div>
            ) : (
              <>
                {/* Favorites */}
                {favoriteGames.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">⭐ 즐겨찾기 ({favoriteGames.length})</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteGames.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          isFavorite={favorites.has(game.id)}
                          isMyGame={true}
                          onCreateRoom={handleCreateRoom}
                          onPreview={handlePreview}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Games */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    기타 게임 ({myGames.length - favoriteGames.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myGames
                      .filter((game) => !favorites.has(game.id))
                      .map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          isFavorite={favorites.has(game.id)}
                          isMyGame={true}
                          onCreateRoom={handleCreateRoom}
                          onPreview={handlePreview}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  isMyGame?: boolean;
  onCreateRoom: (id: string) => void;
  onPreview: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function GameCard({ game, isFavorite, isMyGame, onCreateRoom, onPreview, onToggleFavorite }: GameCardProps) {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 hover:border-primary-200">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">
            🎮 {game.title}
          </h3>
          <button
            onClick={() => onToggleFavorite(game.id)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
              }`}
            />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{game.description || '게임 설명이 없습니다'}</p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            📱 {game.needsMobile ? '모바일 필요' : '모바일 불필요'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {game.duration || 10}분
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {game.maxPlayers || 30}명
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">4.5</span>
          <span>({game.favoriteCount || 0})</span>
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => onCreateRoom(game.id)}
          className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-100 cursor-pointer mb-2"
        >
          {isMyGame ? '편집' : '템플릿으로 시작하기'}
        </button>

        <button
          onClick={() => onPreview(game.id)}
          className="w-full flex items-center justify-center gap-2 bg-transparent border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          미리보기
        </button>

        {/* My Game Actions */}
        {isMyGame && (
          <div className="flex gap-2 mt-2">
            <button className="flex-1 text-sm text-primary-500 hover:text-primary-600 font-medium py-2 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer">
              ✏️ 편집
            </button>
            <button className="flex-1 text-sm text-error hover:text-error-dark font-medium py-2 rounded-lg hover:bg-error-light transition-colors cursor-pointer">
              🗑️ 삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
