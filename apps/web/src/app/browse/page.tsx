'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Star, Users, Clock } from 'lucide-react';
import {
  useTemplates,
  useGames,
  useAuth,
  useDeleteGame,
  useFavoriteIds,
  useAddFavorite,
  useRemoveFavorite,
} from '@/lib/hooks';
import type { Game } from '@xingu/shared';
import { Select, DropdownMenu } from '@/components/ui';

export default function BrowsePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { data: templatesResponse } = useTemplates();
  const { data: myGames = [] } = useGames();
  const { mutateAsync: deleteGame, isPending: isDeleting } = useDeleteGame();
  const { data: favoriteIds = [] } = useFavoriteIds();
  const { mutateAsync: addFavorite } = useAddFavorite();
  const { mutateAsync: removeFavorite } = useRemoveFavorite();

  const [activeTab, setActiveTab] = useState<'browse' | 'myGames'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [mounted, setMounted] = useState(false);

  // Set mounted state after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const templates = templatesResponse?.templates || [];
  const favorites = new Set(favoriteIds);

  // Show loading state only after mounted to avoid hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const filterBySearch = (games: Game[]) => {
    if (!searchQuery.trim()) return games;

    const query = searchQuery.toLowerCase().trim();
    return games.filter((game) => {
      const title = game.title?.toLowerCase() || '';
      const description = game.description?.toLowerCase() || '';
      return title.includes(query) || description.includes(query);
    });
  };

  const filteredTemplates = filterBySearch(templates);
  const filteredMyGames = filterBySearch(myGames);

  const handleCreateRoom = (gameId: string) => {
    if (activeTab === 'myGames') {
      router.push(`/edit/${gameId}`);
    } else {
      router.push(`/edit/new?templateId=${gameId}`);
    }
  };

  const toggleFavorite = async (gameId: string) => {
    try {
      if (favorites.has(gameId)) {
        await removeFavorite(gameId);
      } else {
        await addFavorite(gameId);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('즐겨찾기 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDelete = async (gameId: string) => {
    if (window.confirm('정말 이 게임을 삭제하시겠습니까?')) {
      try {
        await deleteGame(gameId);
        // Query will be automatically invalidated by useDeleteGame hook
      } catch (error) {
        console.error('Failed to delete game:', error);
        alert('게임 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
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
          <DropdownMenu
            trigger={
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || user?.email || '프로필'}
                </span>
              </button>
            }
            items={[
              {
                label: '내 정보',
                onClick: () => {
                  console.log('Profile clicked');
                },
              },
              {
                label: '설정',
                onClick: () => {
                  console.log('Settings clicked');
                },
              },
              {
                label: '로그아웃',
                onClick: () => {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  router.push('/');
                },
                variant: 'danger',
                separator: true,
              },
            ]}
            align="right"
          />
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
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'popular', label: '인기순' },
                { value: 'newest', label: '최신순' },
                { value: 'name', label: '이름순' },
              ]}
            />
          </div>
        </div>

        {/* Browse Tab Content */}
        {activeTab === 'browse' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              전체 게임 ({filteredTemplates.length}
              {searchQuery && templates.length !== filteredTemplates.length && ` / ${templates.length}`})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates
                .sort((a, b) => {
                  const aFav = favorites.has(a.id) ? 1 : 0;
                  const bFav = favorites.has(b.id) ? 1 : 0;
                  return bFav - aFav;
                })
                .map((template) => (
                  <GameCard
                    key={template.id}
                    game={template}
                    isFavorite={favorites.has(template.id)}
                    onCreateRoom={handleCreateRoom}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
            </div>
            {filteredTemplates.length === 0 && searchQuery && (
              <div className="text-center py-16">
                <p className="text-gray-500">검색 결과가 없습니다</p>
              </div>
            )}
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
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  내 게임 ({filteredMyGames.length}
                  {searchQuery && myGames.length !== filteredMyGames.length && ` / ${myGames.length}`})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyGames
                    .sort((a, b) => {
                      const aFav = favorites.has(a.id) ? 1 : 0;
                      const bFav = favorites.has(b.id) ? 1 : 0;
                      return bFav - aFav;
                    })
                    .map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        isFavorite={favorites.has(game.id)}
                        isMyGame={true}
                        onCreateRoom={handleCreateRoom}
                        onToggleFavorite={toggleFavorite}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                      />
                    ))}
                </div>
                {filteredMyGames.length === 0 && searchQuery && (
                  <div className="text-center py-16">
                    <p className="text-gray-500">검색 결과가 없습니다</p>
                  </div>
                )}
              </div>
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
  onToggleFavorite: (id: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

function GameCard({ game, isFavorite, isMyGame, onCreateRoom, onToggleFavorite, onDelete, isDeleting }: GameCardProps) {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 hover:border-primary-200 h-full flex flex-col">
      {/* Card Header */}
      <div className="p-6 flex flex-col flex-1">
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

        {/* Main Action Button */}
        <button
          onClick={() => onCreateRoom(game.id)}
          className="w-full mt-auto bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-100 cursor-pointer"
        >
          방 생성하기
        </button>

        {/* Delete Action - My Games Only */}
        {isMyGame && onDelete && (
          <button
            onClick={() => onDelete(game.id)}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-1 mt-2 text-sm text-error hover:text-error-dark font-medium py-2 rounded-lg hover:bg-error-light border border-error/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? '삭제 중...' : '🗑️ 삭제'}
          </button>
        )}
      </div>
    </div>
  );
}
