import { playlistRepository } from '@/repositories/playlist.repository';
import { uploadToStorage } from '@/utils/storage';
import { BUCKETS } from '@/config/supabase';
import { AppError } from '@/utils/AppError';
import type { CreatePlaylistInput, UpdatePlaylistInput } from '@/dtos/playlist.dto';

async function requireOwnership(playlistId: string, userId: string) {
  const playlist = await playlistRepository.belongsToUser(playlistId, userId);
  if (!playlist) throw AppError.forbidden('Você só pode gerenciar suas próprias playlists');
  return playlist;
}

export const playlistService = {
  create(userId: string, input: CreatePlaylistInput) {
    return playlistRepository.create(userId, input);
  },

  myPlaylists(userId: string) {
    return playlistRepository.findByUser(userId);
  },

  async getById(id: string) {
    const playlist = await playlistRepository.findById(id);
    if (!playlist) throw AppError.notFound('Playlist não encontrada');
    return playlist;
  },

  async update(userId: string, id: string, input: UpdatePlaylistInput) {
    await requireOwnership(id, userId);
    return playlistRepository.update(id, input);
  },

  async uploadCover(userId: string, id: string, file: Express.Multer.File) {
    await requireOwnership(id, userId);
    const coverUrl = await uploadToStorage(BUCKETS.IMAGES, file, `playlists/${id}`);
    return playlistRepository.updateCover(id, coverUrl);
  },

  async delete(userId: string, id: string) {
    await requireOwnership(id, userId);
    await playlistRepository.delete(id);
  },

  async addTrack(userId: string, id: string, trackId: string) {
    await requireOwnership(id, userId);
    return playlistRepository.addTrack(id, trackId);
  },

  async removeTrack(userId: string, id: string, trackId: string) {
    await requireOwnership(id, userId);
    await playlistRepository.removeTrack(id, trackId);
  },
};
