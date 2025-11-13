'use client';

import { useState } from 'react';
import { useTemplates, useGames } from '@/lib/hooks';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Tab = 'templates' | 'myGames';

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<Tab>('templates');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-500">🎮 Xingu</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="게임 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Profile */}
            <Button variant="outline" className="gap-2">
              <User className="w-4 h-4" />
              <span>프로필</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === 'templates'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              둘러보기
            </button>
            <button
              onClick={() => setActiveTab('myGames')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === 'myGames'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              내 게임
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'templates' ? (
          <BrowseTemplatesTab searchQuery={searchQuery} />
        ) : (
          <MyGamesTab searchQuery={searchQuery} />
        )}
      </main>
    </div>
  );
}

function BrowseTemplatesTab({ searchQuery }: { searchQuery: string }) {
  const { data: templateData, isLoading } = useTemplates();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-500">템플릿을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const templates = templateData?.templates || [];
  const filteredTemplates = templates.filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">필터:</span>
          <Button variant="outline" size="sm">
            📱 전체
          </Button>
          <Button variant="outline" size="sm">
            🎉 아이스브레이킹
          </Button>
          <Button variant="outline" size="sm">
            ⏱️ 전체
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">정렬:</span>
          <Button variant="outline" size="sm">
            인기순 ▼
          </Button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates?.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
              <button className="text-2xl hover:scale-110 transition-transform">☆</button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{template.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📱 모바일 불필요</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>⏱️ 10분</span>
                <span>•</span>
                <span>👥 30명</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button className="w-full">방 생성하기</Button>
              <Button variant="outline" className="w-full">
                👁️ 미리보기
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

function MyGamesTab({ searchQuery }: { searchQuery: string }) {
  const { data: games, isLoading } = useGames();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-500">내 게임을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const filteredGames = games?.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">필터:</span>
          <Button variant="outline" size="sm">
            ⭐ 즐겨찾기만
          </Button>
          <Button variant="outline" size="sm">
            최근 플레이순
          </Button>
          <Button variant="outline" size="sm">
            이름순 ▼
          </Button>
        </div>
      </div>

      {/* Games Count */}
      <p className="text-sm text-gray-600">총 {filteredGames?.length || 0}개 게임</p>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames?.map((game) => (
          <div
            key={game.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{game.title}</h3>
              <button className="text-2xl hover:scale-110 transition-transform">⭐</button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{game.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📱 모바일 불필요</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>⏱️ 10분</span>
                <span>•</span>
                <span>👥 30명</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>🎮 0회 플레이</span>
                <span>•</span>
                <span>마지막: -</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button className="w-full">방 생성하기</Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  ✏️ 편집
                </Button>
                <Button variant="outline" className="flex-1 text-red-500 hover:text-red-600">
                  🗑️ 삭제
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGames?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">아직 생성한 게임이 없습니다.</p>
          <Button className="mt-4">새 게임 만들기</Button>
        </div>
      )}
    </div>
  );
}
