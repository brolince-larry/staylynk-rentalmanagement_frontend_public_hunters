/**
 * HTTP Client
 * ──────────
 * Axios instance with interceptors for API requests.
 * Handles errors, auth headers, and request/response transformation.
 */

import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api';

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_CONFIG.API_V1) {
    this.client = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          // Could trigger logout event here
        }

        // Return structured error
        return Promise.reject({
          message: error.response?.data?.message || error.message,
          errors: error.response?.data?.errors,
          status: error.response?.status,
          originalError: error,
        });
      },
    );
  }

  getInstance(): AxiosInstance {
    return this.client;
  }

  // GET request
  async get<T>(url: string, config = {}) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  // POST request
  async post<T>(url: string, data = {}, config = {}) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // PUT request
  async put<T>(url: string, data = {}, config = {}) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // PATCH request
  async patch<T>(url: string, data = {}, config = {}) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // DELETE request
  async delete<T>(url: string, config = {}) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
