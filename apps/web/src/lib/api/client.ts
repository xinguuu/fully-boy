import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from '../auth/token-manager';
import { logger } from '../logger';

// Service-specific URLs for MSA architecture
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_API_AUTH_URL || 'http://localhost:3001';
const TEMPLATE_SERVICE_URL = process.env.NEXT_PUBLIC_API_TEMPLATE_URL || 'http://localhost:3002';
const GAME_SERVICE_URL = process.env.NEXT_PUBLIC_API_GAME_URL || 'http://localhost:3003';
const ROOM_SERVICE_URL = process.env.NEXT_PUBLIC_API_ROOM_URL || 'http://localhost:3004';
const RESULT_SERVICE_URL = process.env.NEXT_PUBLIC_API_RESULT_URL || 'http://localhost:3006';

export class ApiClient {
  private client: AxiosInstance;
  private refreshClient: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.refreshClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = tokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only log errors in development mode
        if (process.env.NODE_ENV === 'development') {
          if (error.response) {
            // API responded with error status
            logger.error('API Error:', originalRequest?.method?.toUpperCase(), originalRequest?.url);
            logger.error('Status:', error.response.status, error.response.statusText);
            logger.error('Response:', error.response.data);
          } else if (error.request) {
            // Request was made but no response received
            logger.error('Network Error:', originalRequest?.method?.toUpperCase(), originalRequest?.url);
            logger.error('Message:', error.message);
          } else {
            // Error in request setup
            logger.error('Request Setup Error:', error.message);
          }
        }

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = tokenManager.getRefreshToken();

          if (!refreshToken) {
            this.isRefreshing = false;
            this.redirectToLogin();
            return Promise.reject(error);
          }

          try {
            const response = await this.refreshClient.post<{
              accessToken: string;
              refreshToken: string;
              user: { id: string; email: string; name: string | null; role: string };
            }>('/api/auth/refresh', { refreshToken });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            tokenManager.setTokens(accessToken, newRefreshToken);

            this.processQueue(null);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            tokenManager.clearTokens();
            this.redirectToLogin();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(null);
      }
    });

    this.failedQueue = [];
  }

  private redirectToLogin() {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export service-specific API clients for MSA architecture
export const authApiClient = new ApiClient(AUTH_SERVICE_URL);
export const templateApiClient = new ApiClient(TEMPLATE_SERVICE_URL);
export const gameApiClient = new ApiClient(GAME_SERVICE_URL);
export const roomApiClient = new ApiClient(ROOM_SERVICE_URL);
export const resultApiClient = new ApiClient(RESULT_SERVICE_URL);

// Legacy export for backwards compatibility (uses auth service)
export const apiClient = authApiClient;
