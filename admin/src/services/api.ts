import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/admin/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data;
              
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('admin');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/admin/auth/login', { email, password });
    return response.data;
  }

  async signup(data: any) {
    const response = await this.api.post('/admin/auth/signup', data);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/admin/auth/profile');
    return response.data;
  }

  // Plan endpoints
  async getPlans() {
    const response = await this.api.get<ApiResponse>('/admin/plans');
    return response.data;
  }

  async getPlan(id: string) {
    const response = await this.api.get<ApiResponse>(`/admin/plans/${id}`);
    return response.data;
  }

  async createPlan(data: any) {
    const response = await this.api.post<ApiResponse>('/admin/plans', data);
    return response.data;
  }

  async updatePlan(id: string, data: any) {
    const response = await this.api.put<ApiResponse>(`/admin/plans/${id}`, data);
    return response.data;
  }

  async deletePlan(id: string) {
    const response = await this.api.delete<ApiResponse>(`/admin/plans/${id}`);
    return response.data;
  }

  // User endpoints
  async getUsers(params?: { role?: string; isActive?: boolean }) {
    const response = await this.api.get<ApiResponse>('/admin/users', { params });
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.api.get<ApiResponse>(`/admin/users/${id}`);
    return response.data;
  }

  // Transaction endpoints
  async getTransactions(params?: { status?: string; userId?: string }) {
    const response = await this.api.get<ApiResponse>('/admin/transactions', { params });
    return response.data;
  }

  async getTransaction(id: string) {
    const response = await this.api.get<ApiResponse>(`/admin/transactions/${id}`);
    return response.data;
  }
}

export default new ApiService();
