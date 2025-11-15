import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BrowsePage from './page';
import * as hooks from '@/lib/hooks';
import { GameType, Category, type Game } from '@xingu/shared';

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

    vi.mocked(hooks.useCurrentUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
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

    vi.mocked(hooks.useCreateGame).mockReturnValue({
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

  it('renders filter buttons', () => {
    render(<BrowsePage />);

    expect(screen.getByText(/📱 전체/)).toBeInTheDocument();
    expect(screen.getByText(/🎉 아이스브레이킹/)).toBeInTheDocument();
  });

  it('changes active filter when filter button clicked', () => {
    render(<BrowsePage />);

    const allFilter = screen.getByText(/📱 전체/);
    const icebreakingFilter = screen.getByText(/아이스브레이킹/);

    expect(allFilter.closest('button')).toHaveClass('bg-primary-500');

    fireEvent.click(icebreakingFilter);
    expect(icebreakingFilter.closest('button')).toHaveClass('bg-primary-500');
  });

  it('renders sort dropdown', () => {
    render(<BrowsePage />);

    const sortSelect = screen.getByDisplayValue('인기순');
    expect(sortSelect).toBeInTheDocument();
  });

  it('changes sort option', () => {
    render(<BrowsePage />);

    const sortSelect = screen.getByDisplayValue('인기순') as HTMLSelectElement;
    fireEvent.change(sortSelect, { target: { value: 'newest' } });

    expect(sortSelect.value).toBe('newest');
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
    vi.mocked(hooks.useGames).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<BrowsePage />);

    const myGamesTab = screen.getByText(/내 게임/);
    fireEvent.click(myGamesTab);

    expect(screen.getByText('아직 만든 게임이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('게임 둘러보기')).toBeInTheDocument();
  });

  it('switches to browse tab when "게임 둘러보기" clicked in empty state', () => {
    vi.mocked(hooks.useGames).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
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
    vi.mocked(hooks.useCurrentUser).mockReturnValue({
      data: { id: 'user-1', email: 'test@example.com', name: null },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
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
