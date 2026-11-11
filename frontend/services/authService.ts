import apiClient from './api';
import { storage } from './storage';
import { AdminUser } from '../types/product';

export const authService = {
  async login(username: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
    const response = await apiClient.post('/auth/login', {
      username: username.trim(),
      password: password.trim(),
    });

    if (response.data.success && response.data.token) {
      await storage.setToken(response.data.token);
      await storage.setUser(response.data.user);
    }

    return response.data;
  },

  async getMe(): Promise<{ success: boolean; user: AdminUser }> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await storage.clear();
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getToken();
    return !!token;
  },

  async getCurrentUser(): Promise<AdminUser | null> {
    return await storage.getUser();
  }
};

