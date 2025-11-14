import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import { tokenManager } from '../auth/token-manager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
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
        // Only log errors in development mode
        if (process.env.NODE_ENV === 'development') {
          if (error.response) {
            // API responded with error status
            console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url);
            console.error('Status:', error.response.status, error.response.statusText);
            console.error('Response:', error.response.data);
          } else if (error.request) {
            // Request was made but no response received
            console.error('Network Error:', error.config?.method?.toUpperCase(), error.config?.url);
            console.error('Message:', error.message);
          } else {
            // Error in request setup
            console.error('Request Setup Error:', error.message);
          }
        }

        // Handle 401 Unauthorized - clear tokens and redirect to login
        if (error.response?.status === 401) {
          tokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            // Don't redirect if already on login page
            if (currentPath !== '/login') {
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }
          }
        }

        return Promise.reject(error);
      }
    );
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

export const apiClient = new ApiClient(API_BASE_URL);
