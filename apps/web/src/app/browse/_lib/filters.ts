import type { Game } from '@xingu/shared';

export type GameCategoryFilter = 'all' | 'QUIZ' | 'PARTY';
export type MobileFilter = 'all' | 'mobile' | 'no-mobile';
export type SortOption = 'popular' | 'newest' | 'name';

export function filterBySearch(games: Game[], searchQuery: string): Game[] {
  if (!searchQuery.trim()) return games;

  const query = searchQuery.toLowerCase().trim();
  return games.filter((game) => {
    const title = game.title?.toLowerCase() || '';
    const description = game.description?.toLowerCase() || '';
    return title.includes(query) || description.includes(query);
  });
}

export function filterByCategory(games: Game[], gameCategory: GameCategoryFilter): Game[] {
  if (gameCategory === 'all') return games;
  return games.filter((game) => game.gameCategory === gameCategory);
}

export function filterByMobile(games: Game[], mobileFilter: MobileFilter): Game[] {
  if (mobileFilter === 'all') return games;
  if (mobileFilter === 'mobile') return games.filter((game) => game.needsMobile === true);
  if (mobileFilter === 'no-mobile') return games.filter((game) => game.needsMobile === false);
  return games;
}

export function sortGames(games: Game[], sortBy: SortOption): Game[] {
  const sorted = [...games];

  switch (sortBy) {
    case 'popular':
      return sorted.sort((a, b) => {
        const playCountDiff = (b.playCount || 0) - (a.playCount || 0);
        if (playCountDiff !== 0) return playCountDiff;
        return (b.favoriteCount || 0) - (a.favoriteCount || 0);
      });
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'name':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    default:
      return sorted;
  }
}

export function applyFilters(
  games: Game[],
  searchQuery: string,
  gameCategory: GameCategoryFilter,
  mobileFilter: MobileFilter,
  sortBy: SortOption
): Game[] {
  return sortGames(
    filterByMobile(filterByCategory(filterBySearch(games, searchQuery), gameCategory), mobileFilter),
    sortBy
  );
}
