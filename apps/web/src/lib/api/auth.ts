import { apiClient } from './client';
import type {
  AuthResponse,
  UserResponse,
  SignupRequest,
  LoginRequest,
  RefreshRequest,
} from '../types/auth';

export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/api/auth/signup', data);
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/api/auth/login', data);
  },

  logout: async (refreshToken: string): Promise<void> => {
    return apiClient.post<void>('/api/auth/logout', { refreshToken });
  },

  refresh: async (data: RefreshRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/api/auth/refresh', data);
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    return apiClient.get<UserResponse>('/api/auth/me');
  },
};
