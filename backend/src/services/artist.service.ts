import { artistRepository } from '@/repositories/artist.repository';
import { userRepository } from '@/repositories/user.repository';
import { authService } from '@/services/auth.service';
import { uploadToStorage, deleteFromStorage } from '@/utils/storage';
import { BUCKETS } from '@/config/supabase';
import { AppError } from '@/utils/AppError';
import type { CreateArtistInput } from '@/dtos/catalog.dto';

async function requireOwnArtist(userId: string) {
  const artist = await artistRepository.findByUserId(userId);
  if (!artist) throw AppError.notFound('Perfil de artista não encontrado');
  return artist;
}

export const artistService = {
  /**
   * Cria o perfil de artista E promove o usuário para a role ARTIST.
   * Sem essa promoção, as rotas protegidas por requireRole('ARTIST')
   * (upload de música, criação de álbum) continuariam devolvendo 403.
   * Devolve uma sessão nova porque a role vive dentro do JWT.
   */
  async createProfile(userId: string, input: CreateArtistInput) {
    const existing = await artistRepository.findByUserId(userId);
    if (existing) throw AppError.conflict('Você já possui um perfil de artista');

    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('Usuário não encontrado');

    const artist = await artistRepository.create({ ...input, userId });
    if (user.role === 'LISTENER') {
      await userRepository.setRole(userId, 'ARTIST');
    }

    const session = await authService.reissueSession(userId);
    return { artist, ...session };
  },

  async getById(id: string) {
    const artist = await artistRepository.findById(id);
    if (!artist) throw AppError.notFound('Artista não encontrado');
    const topTracks = await artistRepository.topTracks(id);
    return { ...artist, topTracks };
  },

  async getOwnCatalog(userId: string) {
    const catalog = await artistRepository.findOwnCatalog(userId);
    if (!catalog) throw AppError.notFound('Você ainda não tem um perfil de artista');
    return {
      ...catalog,
      albums: catalog.albums.map(({ _count, ...album }) => ({
        ...album,
        trackCount: _count.tracks,
      })),
    };
  },

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const artist = await requireOwnArtist(userId);
    const avatarUrl = await uploadToStorage(BUCKETS.IMAGES, file, `artists/${artist.id}/avatar`);
    const updated = await artistRepository.updateImages(artist.id, { avatarUrl });
    await deleteFromStorage(BUCKETS.IMAGES, artist.avatarUrl);
    return updated;
  },

  async uploadCover(userId: string, file: Express.Multer.File) {
    const artist = await requireOwnArtist(userId);
    const coverUrl = await uploadToStorage(BUCKETS.IMAGES, file, `artists/${artist.id}/cover`);
    const updated = await artistRepository.updateImages(artist.id, { coverUrl });
    await deleteFromStorage(BUCKETS.IMAGES, artist.coverUrl);
    return updated;
  },

  search(query: string) {
    return artistRepository.search(query);
  },
};
