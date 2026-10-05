import { api } from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>('/auth/profile');
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
