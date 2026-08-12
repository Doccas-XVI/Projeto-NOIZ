import { trackRepository } from '@/repositories/track.repository';
import { artistRepository } from '@/repositories/artist.repository';
import { uploadToStorage } from '@/utils/storage';
import { BUCKETS } from '@/config/supabase';
import { AppError } from '@/utils/AppError';
import type { CreateTrackInput } from '@/dtos/catalog.dto';

async function requireOwnArtist(userId: string) {
  const artist = await artistRepository.findByUserId(userId);
  if (!artist) throw AppError.forbidden('Você precisa ter um perfil de artista para esta ação');
  return artist;
}

export const trackService = {
  async upload(
    userId: string,
    input: CreateTrackInput,
    audioFile: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    const artist = await requireOwnArtist(userId);

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

    return trackRepository.update(trackId, input);
  },

  async delete(userId: string, trackId: string) {
    const artist = await requireOwnArtist(userId);
    const owns = await trackRepository.belongsToArtist(trackId, artist.id);
    if (!owns) throw AppError.forbidden('Você só pode excluir suas próprias músicas');

    await trackRepository.delete(trackId);
  },

  // Chamado pelo player quando a música é tocada (ex: passou de X segundos)
  async registerPlay(trackId: string) {
    await trackRepository.incrementPlays(trackId);
  },

  search(query: string) {
    return trackRepository.search(query);
  },
};
