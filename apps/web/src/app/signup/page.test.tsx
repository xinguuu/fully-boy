import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from './page';
import * as authHooks from '@/lib/hooks/use-auth';

const mockPush = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/lib/hooks/use-auth');

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authHooks.useSignup).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
      mutate: vi.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: 'idle',
      submittedAt: 0,
      isIdle: true,
    });
  });

  it('renders signup form with all fields', () => {
    render(<SignupPage />);

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Join Xingu and start creating games')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('renders login link', () => {
    render(<SignupPage />);

    const loginLink = screen.getByText('Sign in');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('shows password requirement hint', () => {
    render(<SignupPage />);

    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
  });

  it('submits form with valid data including name', async () => {
    mockMutateAsync.mockResolvedValue({ user: { id: '1', email: 'test@example.com' } });

    render(<SignupPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const nameInput = screen.getByLabelText(/Name/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/browse');
    });
  });

  it('shows error message when signup fails', () => {
    vi.mocked(authHooks.useSignup).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: true,
      error: new Error('Email already exists'),
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
      mutate: vi.fn(),
      variables: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      context: undefined,
      failureCount: 1,
      failureReason: null,
      isPaused: false,
      status: 'error',
      submittedAt: Date.now(),
      isIdle: false,
    });

    render(<SignupPage />);

    expect(screen.getByText('Email already exists or signup failed')).toBeInTheDocument();
  });

  it('shows loading state during signup', () => {
    vi.mocked(authHooks.useSignup).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
      mutate: vi.fn(),
      variables: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: 'pending',
      submittedAt: Date.now(),
      isIdle: false,
    });

    render(<SignupPage />);

    const submitButton = screen.getByRole('button', { name: /Creating account.../i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Creating account...')).toBeInTheDocument();
  });

  it('updates input values correctly', () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(passwordInput, { target: { value: 'securepassword' } });

    expect(emailInput.value).toBe('user@example.com');
    expect(nameInput.value).toBe('John Doe');
    expect(passwordInput.value).toBe('securepassword');
  });

});
