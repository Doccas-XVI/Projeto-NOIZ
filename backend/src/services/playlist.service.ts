import type { Playlist } from '@prisma/client';
import { playlistRepository } from '@/repositories/playlist.repository';
import { uploadToStorage, deleteFromStorage } from '@/utils/storage';
import { BUCKETS } from '@/config/supabase';
import { AppError } from '@/utils/AppError';
import type { CreatePlaylistInput, UpdatePlaylistInput } from '@/dtos/playlist.dto';

async function requireOwnership(playlistId: string, userId: string) {
  const playlist = await playlistRepository.belongsToUser(playlistId, userId);
  if (!playlist) throw AppError.forbidden('Você só pode gerenciar suas próprias playlists');
  return playlist;
}

/** Formato de lista: dados da playlist + quantidade de músicas. */
function withTrackCount<T extends Playlist & { _count: { tracks: number } }>(playlist: T) {
  const { _count, ...rest } = playlist;
  return { ...rest, trackCount: _count.tracks };
}

export const playlistService = {
  async create(userId: string, input: CreatePlaylistInput) {
    return withTrackCount(await playlistRepository.create(userId, input));
  },

  async myPlaylists(userId: string) {
    const playlists = await playlistRepository.findByUser(userId);
    return playlists.map(withTrackCount);
  },

  /**
   * Devolve a playlist com as músicas já "achatadas" (Track[] em ordem),
   * que é o formato que o frontend consome — o detalhe da tabela de junção
   * (PlaylistTrack) não vaza para a API pública.
   * Playlist privada só pode ser vista pela dona (404 para os demais,
   * para não revelar que ela existe).
   */
  async getById(id: string, requesterId: string) {
    const playlist = await playlistRepository.findById(id);
    if (!playlist || (!playlist.isPublic && playlist.userId !== requesterId)) {
      throw AppError.notFound('Playlist não encontrada');
    }

    const { tracks, ...rest } = playlist;
    return {
      ...rest,
      trackCount: tracks.length,
      tracks: tracks.map((entry) => entry.track),
    };
  },

  async update(userId: string, id: string, input: UpdatePlaylistInput) {
    await requireOwnership(id, userId);
    return withTrackCount(await playlistRepository.update(id, input));
  },

  async uploadCover(userId: string, id: string, file: Express.Multer.File) {
    const current = await requireOwnership(id, userId);
    const coverUrl = await uploadToStorage(BUCKETS.IMAGES, file, `playlists/${id}`);
    const updated = await playlistRepository.updateCover(id, coverUrl);
    await deleteFromStorage(BUCKETS.IMAGES, current.coverUrl);
    return updated;
  },

  async delete(userId: string, id: string) {
    const playlist = await requireOwnership(id, userId);
    await playlistRepository.delete(id);
    await deleteFromStorage(BUCKETS.IMAGES, playlist.coverUrl);
  },

  async addTrack(userId: string, id: string, trackId: string) {
    await requireOwnership(id, userId);
    if (await playlistRepository.hasTrack(id, trackId)) {
      throw AppError.conflict('Esta música já está na playlist');
    }
    return playlistRepository.addTrack(id, trackId);
  },

  async removeTrack(userId: string, id: string, trackId: string) {
    await requireOwnership(id, userId);
    await playlistRepository.removeTrack(id, trackId);
  },
};
