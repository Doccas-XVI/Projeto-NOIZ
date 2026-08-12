import { albumRepository } from '@/repositories/album.repository';
import { artistRepository } from '@/repositories/artist.repository';
import { uploadToStorage } from '@/utils/storage';
import { BUCKETS } from '@/config/supabase';
import { AppError } from '@/utils/AppError';
import type { CreateAlbumInput } from '@/dtos/catalog.dto';

async function requireOwnArtist(userId: string) {
  const artist = await artistRepository.findByUserId(userId);
  if (!artist) throw AppError.forbidden('Você precisa ter um perfil de artista para esta ação');
  return artist;
}

export const albumService = {
  async create(userId: string, input: CreateAlbumInput, cover?: Express.Multer.File) {
    const artist = await requireOwnArtist(userId);

    let coverUrl: string | undefined;
    if (cover) {
      coverUrl = await uploadToStorage(BUCKETS.IMAGES, cover, `albums/${artist.id}`);
    }

    return albumRepository.create(artist.id, { ...input, coverUrl });
  },

  async getById(id: string) {
    const album = await albumRepository.findById(id);
    if (!album) throw AppError.notFound('Álbum não encontrado');
    return album;
  },

  recent() {
    return albumRepository.recent();
  },

  search(query: string) {
    return albumRepository.search(query);
  },
};
