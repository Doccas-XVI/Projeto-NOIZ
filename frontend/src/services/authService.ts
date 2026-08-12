import { api } from './api';
import type { AuthResponse } from '@/types/domain';

export const authService = {
  async register(name: string, email: string, password: string) {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/register', {
      name,
      email,
      password,
    });
    return data.data;
  },

  async login(email: string, password: string) {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/login', { email, password });
    return data.data;
  },

  async forgotPassword(email: string) {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string) {
    await api.post('/auth/reset-password', { token, password });
  },

  async logout(refreshToken: string) {
    await api.post('/auth/logout', { refreshToken });
  },
};
