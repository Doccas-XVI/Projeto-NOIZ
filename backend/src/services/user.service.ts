import { userRepository } from '@/repositories/user.repository';
import { toPublicUser } from '@/models/user.model';
import { uploadToStorage, deleteFromStorage } from '@/utils/storage';
import { BUCKETS } from '@/config/supabase';
import { AppError } from '@/utils/AppError';

export const userService = {
  async getProfile(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('Usuário não encontrado');
    return toPublicUser(user);
  },

  async updateProfile(id: string, data: { name?: string }) {
    const user = await userRepository.updateProfile(id, data);
    return toPublicUser(user);
  },

  async uploadAvatar(id: string, file: Express.Multer.File) {
    const current = await userRepository.findById(id);
    if (!current) throw AppError.notFound('Usuário não encontrado');

    const avatarUrl = await uploadToStorage(BUCKETS.IMAGES, file, `users/${id}`);
    const user = await userRepository.updateAvatar(id, avatarUrl);
    await deleteFromStorage(BUCKETS.IMAGES, current.avatarUrl); // não acumula avatares antigos
    return toPublicUser(user);
  },
};
