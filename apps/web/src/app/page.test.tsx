import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from './page';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders homepage with title and PIN input', () => {
    render(<HomePage />);

    expect(screen.getByText(/Xingu/)).toBeInTheDocument();
    expect(screen.getByText(/파티를 더 즐겁게!/)).toBeInTheDocument();
    expect(screen.getByText('게임 PIN 입력')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    expect(screen.getByText('입장하기')).toBeInTheDocument();
  });

  it('renders "게임 만들기" button', () => {
    render(<HomePage />);

    expect(screen.getByText('게임 만들기')).toBeInTheDocument();
  });

  it('renders QR code option text', () => {
    render(<HomePage />);

    expect(screen.getByText('또는 QR 코드로 입장')).toBeInTheDocument();
  });

  it('allows only numeric input in PIN field', () => {
    render(<HomePage />);

    const pinInput = screen.getByPlaceholderText('000000') as HTMLInputElement;

    fireEvent.change(pinInput, { target: { value: 'abc123' } });
    expect(pinInput.value).toBe('123');

    fireEvent.change(pinInput, { target: { value: '!@#456' } });
    expect(pinInput.value).toBe('456');
  });

  it('limits PIN input to 6 digits', () => {
    render(<HomePage />);

    const pinInput = screen.getByPlaceholderText('000000') as HTMLInputElement;

    expect(pinInput).toHaveAttribute('maxLength', '6');
  });

  it('disables submit button when PIN is less than 6 digits', () => {
    render(<HomePage />);

    const pinInput = screen.getByPlaceholderText('000000');
    const submitButton = screen.getByText('입장하기') as HTMLButtonElement;

    fireEvent.change(pinInput, { target: { value: '12345' } });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when PIN is 6 digits', () => {
    render(<HomePage />);

    const pinInput = screen.getByPlaceholderText('000000');
    const submitButton = screen.getByText('입장하기') as HTMLButtonElement;

    fireEvent.change(pinInput, { target: { value: '123456' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows alert when submitting with less than 6 digits', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<HomePage />);

    const pinInput = screen.getByPlaceholderText('000000');
    const form = pinInput.closest('form')!;

    fireEvent.change(pinInput, { target: { value: '123' } });
    fireEvent.submit(form);

    expect(alertSpy).toHaveBeenCalledWith('6자리 PIN을 입력해주세요');
    expect(mockPush).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('navigates to room when submitting valid 6-digit PIN', async () => {
    render(<HomePage />);

    const pinInput = screen.getByPlaceholderText('000000');
    const form = pinInput.closest('form')!;

    fireEvent.change(pinInput, { target: { value: '123456' } });
    fireEvent.submit(form);

    expect(screen.getByText(/입장 중.../)).toBeInTheDocument();

    vi.runAllTimers();

    expect(mockPush).toHaveBeenCalledWith('/room/123456');
  });

  it('shows loading state when submitting valid PIN', () => {
    render(<HomePage />);

    const pinInput = screen.getByPlaceholderText('000000');
    const form = pinInput.closest('form')!;

    fireEvent.change(pinInput, { target: { value: '123456' } });
    fireEvent.submit(form);

    expect(screen.getByText(/입장 중.../)).toBeInTheDocument();
    const submitButton = screen.getByText(/입장 중.../).closest('button') as HTMLButtonElement;
    expect(submitButton).toBeDisabled();
  });

  it('navigates to /browse when "게임 만들기" clicked with access token', () => {
    localStorage.setItem('access_token', 'fake-token');

    render(<HomePage />);

    const createButton = screen.getByText('게임 만들기');
    fireEvent.click(createButton);

    expect(mockPush).toHaveBeenCalledWith('/browse');
  });

  it('navigates to /login with redirect when "게임 만들기" clicked without access token', () => {
    render(<HomePage />);

    const createButton = screen.getByText('게임 만들기');
    fireEvent.click(createButton);

    expect(mockPush).toHaveBeenCalledWith('/login?redirect=/browse');
  });
});
