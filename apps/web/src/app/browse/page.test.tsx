import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import BrowsePage from './page';
import * as hooks from '@/lib/hooks';
import { GameType, Category, TemplateCategory, type Game } from '@xingu/shared';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/lib/hooks');

vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  User: () => <div data-testid="user-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Star: ({ className }: { className?: string }) => <div data-testid="star-icon" className={className} />,
  Users: () => <div data-testid="users-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Check: () => <div data-testid="check-icon" />,
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
};

const mockTemplates: Game[] = [
  {
    id: 'template-1',
    title: '밸런스 게임',
    description: '재미있는 밸런스 게임',
    gameType: GameType.BALANCE_GAME,
    category: Category.ICE_BREAKING,
    gameCategory: TemplateCategory.QUIZ,
    isPublic: true,
    duration: 10,
    minPlayers: 2,
    maxPlayers: 30,
    needsMobile: false,
    playCount: 100,
    favoriteCount: 50,
    settings: {},
    userId: 'admin',
    thumbnail: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMyGames: Game[] = [
  {
    id: 'my-game-1',
    title: '내 게임',
    description: '내가 만든 게임',
    gameType: GameType.BALANCE_GAME,
    category: Category.ICE_BREAKING,
    gameCategory: TemplateCategory.QUIZ,
    isPublic: false,
    duration: 15,
    minPlayers: 3,
    maxPlayers: 50,
    needsMobile: true,
    playCount: 0,
    favoriteCount: 0,
    settings: {},
    userId: 'user-1',
    thumbnail: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('BrowsePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(hooks.useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    } as any);

    vi.mocked(hooks.useTemplates).mockReturnValue({
      data: { templates: mockTemplates },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useGames).mockReturnValue({
      data: mockMyGames,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useDeleteGame).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(hooks.useFavoriteIds).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useAddFavorite).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(hooks.useRemoveFavorite).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it('renders header with logo, search bar, and profile', () => {
    render(<BrowsePage />);

    expect(screen.getByText(/Xingu/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('게임 검색...')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('navigates to homepage when logo is clicked', () => {
    render(<BrowsePage />);

    const logo = screen.getByText(/Xingu/);
    fireEvent.click(logo);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('updates search query when typing', () => {
    render(<BrowsePage />);

    const searchInput = screen.getByPlaceholderText('게임 검색...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: '밸런스' } });

    expect(searchInput.value).toBe('밸런스');
  });

  it('toggles profile dropdown menu', () => {
    render(<BrowsePage />);

    const profileButton = screen.getByText('Test User').closest('button')!;
    fireEvent.click(profileButton);

    expect(screen.getByText('내 정보')).toBeInTheDocument();
    expect(screen.getByText('설정')).toBeInTheDocument();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();

    fireEvent.click(profileButton);
  });

  it('logs out and navigates to homepage when logout button clicked', () => {
    render(<BrowsePage />);

    const profileButton = screen.getByText('Test User').closest('button')!;
    fireEvent.click(profileButton);

    const logoutButton = screen.getByText('로그아웃');
    fireEvent.click(logoutButton);

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('renders both tabs with correct labels', () => {
    render(<BrowsePage />);

    expect(screen.getByText('둘러보기')).toBeInTheDocument();
    expect(screen.getByText(/내 게임/)).toBeInTheDocument();
  });

  it('switches between browse and myGames tabs', () => {
    render(<BrowsePage />);

    const browseTab = screen.getByText('둘러보기');
    const myGamesTab = screen.getByText(/내 게임/);

    expect(browseTab.closest('button')).toHaveClass('text-primary-500');

    fireEvent.click(myGamesTab);
    expect(myGamesTab.closest('button')).toHaveClass('text-primary-500');

    fireEvent.click(browseTab);
    expect(browseTab.closest('button')).toHaveClass('text-primary-500');
  });

  it('renders game category buttons', () => {
    render(<BrowsePage />);

    const categorySection = screen.getByText('게임 유형:').parentElement;
    expect(categorySection).toBeInTheDocument();

    const allButton = within(categorySection!).getByRole('button', { name: '전체' });
    const quizButton = within(categorySection!).getByRole('button', { name: /📝 퀴즈 게임/ });
    const partyButton = within(categorySection!).getByRole('button', { name: /🎉 파티 게임/ });

    expect(allButton).toBeInTheDocument();
    expect(quizButton).toBeInTheDocument();
    expect(partyButton).toBeInTheDocument();
  });

  it('changes active game category when category button clicked', () => {
    render(<BrowsePage />);

    const categorySection = screen.getByText('게임 유형:').parentElement;

    const allButton = within(categorySection!).getByRole('button', { name: '전체' });
    const quizButton = within(categorySection!).getByRole('button', { name: /📝 퀴즈 게임/ });
    const partyButton = within(categorySection!).getByRole('button', { name: /🎉 파티 게임/ });

    expect(allButton).toHaveClass('bg-primary-500');

    fireEvent.click(quizButton);
    expect(quizButton).toHaveClass('bg-primary-500');

    fireEvent.click(partyButton);
    expect(partyButton).toHaveClass('bg-primary-500');
  });

  it('renders sort dropdown', () => {
    render(<BrowsePage />);

    const sortSection = screen.getByText('정렬:').parentElement;
    expect(sortSection).toBeInTheDocument();

    const sortButton = within(sortSection!).getByText('인기순');
    expect(sortButton).toBeInTheDocument();
  });

  it('changes sort option', () => {
    render(<BrowsePage />);

    const sortSection = screen.getByText('정렬:').parentElement;
    const sortButton = within(sortSection!).getByText('인기순');
    fireEvent.click(sortButton);

    const newestOption = screen.getByText('최신순');
    fireEvent.click(newestOption);

    expect(within(sortSection!).getByText('최신순')).toBeInTheDocument();
  });

  it('renders template cards in browse tab', () => {
    render(<BrowsePage />);

    expect(screen.getByText(/🎮 밸런스 게임/)).toBeInTheDocument();
    expect(screen.getByText('재미있는 밸런스 게임')).toBeInTheDocument();
  });

  it('toggles favorite when star button clicked', () => {
    render(<BrowsePage />);

    const starButtons = screen.getAllByLabelText('즐겨찾기 추가');
    fireEvent.click(starButtons[0]);

    waitFor(() => {
      expect(screen.getByText(/즐겨찾기 \(1\)/)).toBeInTheDocument();
    });
  });

  it('navigates to edit page with template ID when "방 생성하기" button clicked', () => {
    render(<BrowsePage />);

    const createRoomButtons = screen.getAllByText('방 생성하기');
    fireEvent.click(createRoomButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/edit/new?templateId=template-1');
  });

  it('shows empty state in myGames tab when no games', () => {
    vi.clearAllMocks();
    vi.mocked(hooks.useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    } as any);
    vi.mocked(hooks.useTemplates).mockReturnValue({
      data: { templates: mockTemplates },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    vi.mocked(hooks.useGames).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    vi.mocked(hooks.useDeleteGame).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(hooks.useFavoriteIds).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    vi.mocked(hooks.useAddFavorite).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(hooks.useRemoveFavorite).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<BrowsePage />);

    const myGamesTab = screen.getByText(/내 게임/);
    fireEvent.click(myGamesTab);

    expect(screen.getByText('아직 만든 게임이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('게임 둘러보기')).toBeInTheDocument();
  });

  it('switches to browse tab when "게임 둘러보기" clicked in empty state', () => {
    vi.clearAllMocks();
    vi.mocked(hooks.useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    } as any);
    vi.mocked(hooks.useTemplates).mockReturnValue({
      data: { templates: mockTemplates },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    vi.mocked(hooks.useGames).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    vi.mocked(hooks.useDeleteGame).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(hooks.useFavoriteIds).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    vi.mocked(hooks.useAddFavorite).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(hooks.useRemoveFavorite).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<BrowsePage />);

    const myGamesTab = screen.getByText(/내 게임/);
    fireEvent.click(myGamesTab);

    const browseButton = screen.getByText('게임 둘러보기');
    fireEvent.click(browseButton);

    const browseTab = screen.getByText('둘러보기');
    expect(browseTab.closest('button')).toHaveClass('text-primary-500');
  });

  it('renders my games in myGames tab', () => {
    render(<BrowsePage />);

    const myGamesTab = screen.getByText(/내 게임/);
    fireEvent.click(myGamesTab);

    expect(screen.getByText(/🎮 내 게임/)).toBeInTheDocument();
    expect(screen.getByText('내가 만든 게임')).toBeInTheDocument();
  });

  it('shows delete button for my games', () => {
    render(<BrowsePage />);

    const myGamesTab = screen.getByText(/내 게임/);
    fireEvent.click(myGamesTab);

    const deleteButtons = screen.getAllByRole('button', { name: /삭제/ });
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('displays user email when name is not available', () => {
    vi.mocked(hooks.useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com', name: null },
      isLoading: false,
      isAuthenticated: true,
    } as any);

    render(<BrowsePage />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('navigates to edit page when "방 생성하기" clicked in myGames tab', () => {
    render(<BrowsePage />);

    const myGamesTab = screen.getByText(/내 게임/);
    fireEvent.click(myGamesTab);

    const createRoomButtons = screen.getAllByText('방 생성하기');
    fireEvent.click(createRoomButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/edit/my-game-1');
  });
});
