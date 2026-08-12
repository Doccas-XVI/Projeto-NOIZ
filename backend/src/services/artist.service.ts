import { artistRepository } from '@/repositories/artist.repository';
import { uploadToStorage } from '@/utils/storage';
import { BUCKETS } from '@/config/supabase';
import { AppError } from '@/utils/AppError';
import type { CreateArtistInput } from '@/dtos/catalog.dto';

export const artistService = {
  async createProfile(userId: string, input: CreateArtistInput) {
    const existing = await artistRepository.findByUserId(userId);
    if (existing) throw AppError.conflict('Você já possui um perfil de artista');
    return artistRepository.create({ ...input, userId });
  },

  async getById(id: string) {
    const artist = await artistRepository.findById(id);
    if (!artist) throw AppError.notFound('Artista não encontrado');
    return artist;
  },

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const artist = await artistRepository.findByUserId(userId);
    if (!artist) throw AppError.notFound('Perfil de artista não encontrado');

    const avatarUrl = await uploadToStorage(BUCKETS.IMAGES, file, `artists/${artist.id}/avatar`);
    return artistRepository.updateImages(artist.id, { avatarUrl });
  },

  async uploadCover(userId: string, file: Express.Multer.File) {
    const artist = await artistRepository.findByUserId(userId);
    if (!artist) throw AppError.notFound('Perfil de artista não encontrado');

    const coverUrl = await uploadToStorage(BUCKETS.IMAGES, file, `artists/${artist.id}/cover`);
    return artistRepository.updateImages(artist.id, { coverUrl });
  },

  search(query: string) {
    return artistRepository.search(query);
  },
};
