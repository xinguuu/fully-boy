'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  TrendingUp,
  Crown,
  Smartphone,
  Zap,
  Sparkles,
  History,
  Settings,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useTemplates,
  useGames,
  useAuth,
  useDeleteGame,
  useAddFavorite,
  useRemoveFavorite,
} from '@/lib/hooks';
import { Select, DropdownMenu, ConfirmDialog } from '@/components/ui';
import { Footer } from '@/components/layout/Footer';
import { logger } from '@/lib/logger';
import { GameCard } from './_components';
import { GAME_TYPE_CARDS } from './_lib/constants';
import {
  applyFilters,
  type GameCategoryFilter,
  type MobileFilter,
  type SortOption,
} from './_lib/filters';

export default function BrowsePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  // State declarations
  const [activeTab, setActiveTab] = useState<'browse' | 'myGames'>('browse');
  const [gameCategory, setGameCategory] = useState<GameCategoryFilter>('all');
  const [mobileFilter, setMobileFilter] = useState<MobileFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [mounted, setMounted] = useState(false);
  const [deleteGameId, setDeleteGameId] = useState<string | null>(null);

  // Data fetching hooks
  const { data: templatesResponse } = useTemplates();
  const { data: myGames = [] } = useGames();
  const { mutateAsync: deleteGame, isPending: isDeleting } = useDeleteGame();
  const { mutateAsync: addFavorite } = useAddFavorite();
  const { mutateAsync: removeFavorite } = useRemoveFavorite();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const templates = templatesResponse?.templates || [];

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

  if (!isAuthenticated) {
    return null;
  }

  const filteredTemplates = applyFilters(templates, searchQuery, gameCategory, mobileFilter, sortBy);
  const filteredMyGames = applyFilters(myGames, searchQuery, gameCategory, mobileFilter, sortBy);

  const handleCreateRoom = (gameId: string) => {
    if (activeTab === 'myGames') {
      router.push(`/edit/${gameId}`);
    } else {
      router.push(`/edit/new?templateId=${gameId}`);
    }
  };

  const toggleFavorite = async (gameId: string, isFavorite: boolean) => {
    logger.debug('toggleFavorite called', { gameId, isFavorite });
    try {
      if (isFavorite) {
        await removeFavorite(gameId);
      } else {
        await addFavorite(gameId);
      }
    } catch (error) {
      logger.error('Failed to toggle favorite:', error);
      toast.error('즐겨찾기 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteClick = (gameId: string) => {
    setDeleteGameId(gameId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteGameId) return;
    try {
      await deleteGame(deleteGameId);
      toast.success('게임이 삭제되었습니다.');
    } catch (error) {
      logger.error('Failed to delete game:', error);
      toast.error('게임 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setDeleteGameId(null);
    }
  };

  const scrollToGames = () => {
    const gamesSection = document.getElementById('games-section');
    if (gamesSection) {
      gamesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer"
          >
            🎮 Xingu
          </button>

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
                icon: <User className="w-4 h-4" />,
                onClick: () => logger.debug('Profile clicked'),
              },
              {
                label: '플레이 기록',
                icon: <History className="w-4 h-4" />,
                onClick: () => router.push('/history'),
              },
              {
                label: '설정',
                icon: <Settings className="w-4 h-4" />,
                onClick: () => logger.debug('Settings clicked'),
              },
              {
                label: '로그아웃',
                icon: <LogOut className="w-4 h-4" />,
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

      {/* Hero Section */}
      <section
        className={`relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white transition-all duration-500 ease-in-out ${
          activeTab === 'browse' && !searchQuery
            ? 'max-h-[500px] opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative transition-all duration-500 ease-in-out ${
            activeTab === 'browse' && !searchQuery ? 'py-16' : 'py-0'
          }`}
        >
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
              <Sparkles className="w-4 h-4" />
              한국 최고의 파티 게임 플랫폼
            </div>
            <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
              모두가 함께 즐기는
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                실시간 퀴즈 & 파티 게임
              </span>
            </h1>
            <p className="text-xl text-primary-50 mb-8">
              OX 퀴즈, 밸런스 게임, 초성 퀴즈 등 6가지 게임 타입 지원 ✨
              <br />
              질문만 바꾸면 5분 만에 완성!
            </p>
            <button
              onClick={scrollToGames}
              className="px-10 py-4 bg-white text-primary-600 font-bold text-lg rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              🎮 게임 만들기
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tabs */}
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
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                둘러보기
              </span>
            </button>
            <button
              onClick={() => setActiveTab('myGames')}
              className={`pb-3 px-1 border-b-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'myGames'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                내 게임 ({myGames.length})
              </span>
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div id="games-section" className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">게임 유형:</span>
              <button
                onClick={() => setGameCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  gameCategory === 'all'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setGameCategory('QUIZ')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  gameCategory === 'QUIZ'
                    ? 'bg-gradient-to-r from-primary-500 to-orange-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-400'
                }`}
              >
                📝 퀴즈 게임
              </button>
              <button
                onClick={() => setGameCategory('PARTY')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  gameCategory === 'PARTY'
                    ? 'bg-gradient-to-r from-secondary-500 to-blue-600 text-white shadow-lg shadow-secondary-500/30'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-400'
                }`}
              >
                🎉 파티 게임
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">정렬:</span>
              <Select
                value={sortBy}
                onChange={(value) => setSortBy(value as SortOption)}
                options={[
                  { value: 'popular', label: '인기순' },
                  { value: 'newest', label: '최신순' },
                  { value: 'name', label: '이름순' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">참여 방식:</span>
            <button
              onClick={() => setMobileFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mobileFilter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setMobileFilter('mobile')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mobileFilter === 'mobile'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              핸드폰 필요
            </button>
            <button
              onClick={() => setMobileFilter('no-mobile')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mobileFilter === 'no-mobile'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-3 h-3" />
              화면만 필요
            </button>
          </div>
        </div>

        {/* Browse Tab Content */}
        {activeTab === 'browse' && (
          <div>
            {!searchQuery && (
              <section className="mb-10">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">🎮 새 게임 만들기</h2>
                  <p className="text-gray-600">
                    원하는 게임 타입을 선택해서 처음부터 만들어보세요!
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {GAME_TYPE_CARDS.map((gameType) => (
                    <button
                      key={gameType.type}
                      onClick={() => router.push(`/edit/new?gameType=${gameType.type}`)}
                      className={`group relative p-4 rounded-xl border-2 border-transparent bg-gradient-to-br ${gameType.gradient} text-white shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative text-center">
                        <div className="text-3xl mb-2">{gameType.emoji}</div>
                        <div className="font-bold text-sm mb-1">{gameType.name}</div>
                        <div className="text-xs opacity-90 line-clamp-2">{gameType.description}</div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-white/30">
                          {gameType.isParty ? '파티' : '퀴즈'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">💡 템플릿으로 빠르게 시작하기</h2>
              <p className="text-gray-600">
                인기 템플릿을 선택하고 질문만 수정하면 완성! ({filteredTemplates.length}개
                {searchQuery &&
                  templates.length !== filteredTemplates.length &&
                  ` / ${templates.length}개`}
                )
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template, index) => (
                <GameCard
                  key={template.id}
                  game={template}
                  isFavorite={template.isFavorite || false}
                  rank={sortBy === 'popular' && !searchQuery ? index + 1 : undefined}
                  onCreateRoom={handleCreateRoom}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
            {filteredTemplates.length === 0 && searchQuery && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">🔍 검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* My Games Tab Content */}
        {activeTab === 'myGames' && (
          <div>
            {myGames.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-gray-500 text-lg mb-4">아직 만든 게임이 없습니다</p>
                <p className="text-gray-400 mb-6">템플릿을 선택해서 나만의 게임을 만들어보세요!</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
                >
                  게임 둘러보기
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  내 게임 ({filteredMyGames.length}
                  {searchQuery &&
                    myGames.length !== filteredMyGames.length &&
                    ` / ${myGames.length}`}
                  )
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isFavorite={game.isFavorite || false}
                      isMyGame={true}
                      onCreateRoom={handleCreateRoom}
                      onToggleFavorite={toggleFavorite}
                      onDelete={handleDeleteClick}
                      onViewHistory={() => router.push(`/games/${game.id}/history`)}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>
                {filteredMyGames.length === 0 && searchQuery && (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">🔍 검색 결과가 없습니다</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <ConfirmDialog
        open={!!deleteGameId}
        onOpenChange={(open) => !open && setDeleteGameId(null)}
        title="게임 삭제"
        description="정말 이 게임을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
