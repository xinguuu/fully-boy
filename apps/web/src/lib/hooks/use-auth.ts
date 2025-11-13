import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { tokenManager } from '../auth/token-manager';
import type { SignupRequest, LoginRequest } from '../types/auth';

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: (response) => {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
      queryClient.setQueryData(['currentUser'], response.user);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
      queryClient.setQueryData(['currentUser'], response.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');
      return authApi.logout(refreshToken);
    },
    onSuccess: () => {
      tokenManager.clearTokens();
      queryClient.clear();
      window.location.href = '/';
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: tokenManager.hasValidToken(),
    retry: false,
  });
}
