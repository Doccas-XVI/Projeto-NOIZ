import { userRepository } from '@/repositories/user.repository';
import { uploadToStorage } from '@/utils/storage';
import { BUCKETS } from '@/config/supabase';
import { AppError } from '@/utils/AppError';

export const userService = {
  async getProfile(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('Usuário não encontrado');
    const { passwordHash, resetToken, resetTokenExpiry, ...safe } = user;
    return safe;
  },

  updateProfile(id: string, data: { name?: string }) {
    return userRepository.updateProfile(id, data);
  },

  async uploadAvatar(id: string, file: Express.Multer.File) {
    const avatarUrl = await uploadToStorage(BUCKETS.IMAGES, file, `users/${id}`);
    return userRepository.updateAvatar(id, avatarUrl);
  },
};
