import { api } from './api';
import type { User } from '@/types/domain';

type Envelope<T> = { data: T };

export const userService = {
  async me() {
    const { data } = await api.get<Envelope<User>>('/users/me');
    return data.data;
  },

  async updateProfile(name: string) {
    const { data } = await api.patch<Envelope<User>>('/users/me', { name });
    return data.data;
  },

  async uploadAvatar(file: File) {
    const form = new FormData();
    form.append('image', file);
    const { data } = await api.post<Envelope<User>>('/users/me/avatar', form);
    return data.data;
  },
};
