import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditPage from './page';
import type { Game, GameType, Category } from '@xingu/shared';
import * as hooks from '@/lib/hooks';

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockMutateAsync = vi.fn();
const mockCreateRoomMutateAsync = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-game-id' }),
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/hooks');

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  GripVertical: () => <div data-testid="grip-icon" />,
}));

const mockGame: Game = {
  id: 'test-game-id',
  title: '테스트 게임',
  description: '테스트 설명',
  thumbnail: null,
  gameType: 'BALANCE_GAME' as GameType,
  category: 'ICE_BREAKING' as Category,
  isPublic: false,
  duration: 10,
  minPlayers: 2,
  maxPlayers: 50,
  needsMobile: false,
  playCount: 0,
  favoriteCount: 0,
  settings: { timeLimit: 30, soundEnabled: true },
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('EditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hooks.useCreateRoom).mockReturnValue({
      mutateAsync: mockCreateRoomMutateAsync,
      isPending: false,
    } as any);
  });

  it('shows loading spinner when isLoading is true', () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    const { container } = render(<EditPage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows "게임을 찾을 수 없습니다" when game is null', () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    render(<EditPage />);

    expect(screen.getByText('게임을 찾을 수 없습니다')).toBeInTheDocument();
  });

  it('renders game data correctly', () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: mockGame,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    render(<EditPage />);

    expect(screen.getByDisplayValue('테스트 게임')).toBeInTheDocument();
    expect(screen.getByDisplayValue('테스트 설명')).toBeInTheDocument();
    expect(screen.getByText(/모바일 불필요/)).toBeInTheDocument();
    expect(screen.getByText(/10분 예상/)).toBeInTheDocument();
  });

  it('updates title on input change', async () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: mockGame,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    render(<EditPage />);

    const titleInput = screen.getByLabelText(/게임 제목/);
    fireEvent.change(titleInput, { target: { value: '새로운 제목' } });

    await waitFor(() => {
      expect(titleInput).toHaveValue('새로운 제목');
    });
  });

  it('updates description on textarea change', async () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: mockGame,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    render(<EditPage />);

    const descriptionTextarea = screen.getByLabelText('설명');
    fireEvent.change(descriptionTextarea, { target: { value: '새로운 설명' } });

    await waitFor(() => {
      expect(descriptionTextarea).toHaveValue('새로운 설명');
    });
  });

  it('toggles sound setting', async () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: mockGame,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    render(<EditPage />);

    const soundToggle = screen.getByRole('switch');
    expect(soundToggle).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(soundToggle);

    await waitFor(() => {
      expect(soundToggle).toHaveAttribute('aria-checked', 'false');
    });
  });

  it('changes time limit setting', async () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: mockGame,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    render(<EditPage />);

    const timeLimitSelect = screen.getByLabelText(/질문당 제한 시간/);
    fireEvent.change(timeLimitSelect, { target: { value: '60' } });

    await waitFor(() => {
      expect(timeLimitSelect).toHaveValue('60');
    });
  });

  it('adds new question', async () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: mockGame,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    render(<EditPage />);

    const addButton = screen.getByText('질문 추가');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('질문을 입력하세요')).toBeInTheDocument();
    });
  });

  it('deletes question', async () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: mockGame,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    render(<EditPage />);

    const addButton = screen.getByText('질문 추가');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('1.')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('질문 삭제');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('1.')).not.toBeInTheDocument();
      expect(screen.getByText('아직 질문이 없습니다')).toBeInTheDocument();
    });
  });

  it('calls updateGame on save button click', async () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: mockGame,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    mockMutateAsync.mockResolvedValue(mockGame);

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    render(<EditPage />);

    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        title: '테스트 게임',
        description: '테스트 설명',
        settings: { timeLimit: 30, soundEnabled: true },
        questions: [],
      });
      expect(mockPush).toHaveBeenCalledWith('/browse');
    });
  });

  it('calls updateGame and createRoom on save and create room', async () => {
    vi.mocked(hooks.useGame).mockReturnValue({
      data: mockGame,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    mockMutateAsync.mockResolvedValue(mockGame);
    mockCreateRoomMutateAsync.mockResolvedValue({
      id: 'room-id',
      pin: '123456',
      gameId: 'test-game-id',
      organizerId: 'test-user-id',
      status: 'waiting',
      createdAt: new Date(),
      expiresAt: new Date(),
      participantCount: 0,
    });

    vi.mocked(hooks.useUpdateGame).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    render(<EditPage />);

    const saveAndCreateButton = screen.getByText('저장하고 방 생성');
    fireEvent.click(saveAndCreateButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        title: '테스트 게임',
        description: '테스트 설명',
        settings: { timeLimit: 30, soundEnabled: true },
        questions: [],
      });
      expect(mockCreateRoomMutateAsync).toHaveBeenCalledWith({
        gameId: 'test-game-id',
        expiresInMinutes: 60,
      });
      expect(mockPush).toHaveBeenCalledWith('/room/123456/waiting');
    });
  });
});
