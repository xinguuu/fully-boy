import type { User } from '@xingu/shared';
import { authClient } from './client';

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    return authClient.post<AuthResponse>('/signup', data);
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    return authClient.post<AuthResponse>('/login', data);
  },

  logout: async (): Promise<void> => {
    return authClient.post<void>('/logout');
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    return authClient.post<{ accessToken: string }>('/refresh', { refreshToken });
  },

  getCurrentUser: async (): Promise<User> => {
    return authClient.get<User>('/me');
  },
};
