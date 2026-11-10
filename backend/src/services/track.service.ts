import { trackRepository } from '@/repositories/track.repository';
import { artistRepository } from '@/repositories/artist.repository';
import { albumRepository } from '@/repositories/album.repository';
import { uploadToStorage, deleteFromStorage } from '@/utils/storage';
import { BUCKETS } from '@/config/supabase';
import { AppError } from '@/utils/AppError';
import type { CreateTrackInput } from '@/dtos/catalog.dto';

async function requireOwnArtist(userId: string) {
  const artist = await artistRepository.findByUserId(userId);
  if (!artist) throw AppError.forbidden('Você precisa ter um perfil de artista para esta ação');
  return artist;
}

/** Impede colocar uma música dentro do álbum de OUTRO artista. */
async function assertAlbumOwnership(albumId: string | undefined, artistId: string) {
  if (!albumId) return;
  const album = await albumRepository.belongsToArtist(albumId, artistId);
  if (!album) throw AppError.forbidden('Você só pode adicionar músicas aos seus próprios álbuns');
}

export const trackService = {
  async upload(
    userId: string,
    input: CreateTrackInput,
    audioFile: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    const artist = await requireOwnArtist(userId);
    await assertAlbumOwnership(input.albumId, artist.id);

    const fileUrl = await uploadToStorage(BUCKETS.TRACKS, audioFile, `artists/${artist.id}`);
    const coverUrl = coverFile
      ? await uploadToStorage(BUCKETS.IMAGES, coverFile, `tracks/${artist.id}`)
      : undefined;

    return trackRepository.create(artist.id, { ...input, fileUrl, coverUrl });
  },

  async getById(id: string) {
    const track = await trackRepository.findById(id);
    if (!track) throw AppError.notFound('Música não encontrada');
    return track;
  },

  async update(userId: string, trackId: string, input: Partial<CreateTrackInput>) {
    const artist = await requireOwnArtist(userId);
    const owns = await trackRepository.belongsToArtist(trackId, artist.id);
    if (!owns) throw AppError.forbidden('Você só pode editar suas próprias músicas');
    await assertAlbumOwnership(input.albumId, artist.id);

    return trackRepository.update(trackId, input);
  },

  async delete(userId: string, trackId: string) {
    const artist = await requireOwnArtist(userId);
    const track = await trackRepository.belongsToArtist(trackId, artist.id);
    if (!track) throw AppError.forbidden('Você só pode excluir suas próprias músicas');

    await trackRepository.delete(trackId);
    // Limpa os arquivos órfãos do storage (best-effort)
    await deleteFromStorage(BUCKETS.TRACKS, track.fileUrl);
    await deleteFromStorage(BUCKETS.IMAGES, track.coverUrl);
  },

  trending() {
    return trackRepository.trending();
  },

  search(query: string) {
    return trackRepository.search(query);
  },
};
