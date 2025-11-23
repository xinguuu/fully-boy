import { authApiClient } from './client';
import type {
  AuthResponse,
  UserResponse,
  SignupRequest,
  LoginRequest,
  RefreshRequest,
} from '../types/auth';

export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    return authApiClient.post<AuthResponse>('/api/auth/signup', data);
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return authApiClient.post<AuthResponse>('/api/auth/login', data);
  },

  logout: async (refreshToken: string): Promise<void> => {
    return authApiClient.post<void>('/api/auth/logout', { refreshToken });
  },

  refresh: async (data: RefreshRequest): Promise<AuthResponse> => {
    return authApiClient.post<AuthResponse>('/api/auth/refresh', data);
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    return authApiClient.get<UserResponse>('/api/auth/me');
  },
};
