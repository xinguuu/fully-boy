import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type SignupData, type LoginData } from '../api';
import { tokenManager } from '../auth';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: tokenManager.hasValidToken(),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupData) => authApi.signup(data),
    onSuccess: (response) => {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
      queryClient.setQueryData(['currentUser'], response.user);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response) => {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
      queryClient.setQueryData(['currentUser'], response.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      tokenManager.clearTokens();
      queryClient.clear();
    },
  });
}
