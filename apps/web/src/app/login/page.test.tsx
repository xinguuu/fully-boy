import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import * as authHooks from '@/lib/hooks/use-auth';

const mockPush = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}));

vi.mock('@/lib/hooks/use-auth');

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authHooks.useLogin).mockReturnValue({
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

  it('renders login form with all fields', () => {
    render(<LoginPage />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your Xingu account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders signup link', () => {
    render(<LoginPage />);

    const signupLink = screen.getByText('Sign up');
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('submits form with valid credentials and redirects to /browse', async () => {
    mockMutateAsync.mockResolvedValue({ user: { id: '1', email: 'test@example.com' } });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/browse');
    });
  });

  it('shows error message when login fails', async () => {
    vi.mocked(authHooks.useLogin).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: true,
      error: new Error('Invalid credentials'),
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
      mutate: vi.fn(),
      variables: { email: 'test@example.com', password: 'password123' },
      context: undefined,
      failureCount: 1,
      failureReason: null,
      isPaused: false,
      status: 'error',
      submittedAt: Date.now(),
      isIdle: false,
    });

    render(<LoginPage />);

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('shows loading state during login', () => {
    vi.mocked(authHooks.useLogin).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
      mutate: vi.fn(),
      variables: { email: 'test@example.com', password: 'password123' },
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: 'pending',
      submittedAt: Date.now(),
      isIdle: false,
    });

    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /Signing in.../i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('updates input values correctly', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'mypassword' } });

    expect(emailInput.value).toBe('user@example.com');
    expect(passwordInput.value).toBe('mypassword');
  });
});
