import { api } from './api';
import type { Playlist, Track } from '@/types/domain';

type Envelope<T> = { data: T };

export interface PlaylistInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

/** Tudo que é "do usuário": playlists, favoritos e histórico. */
export const libraryService = {
  // ---- Playlists ----
  async myPlaylists() {
    const { data } = await api.get<Envelope<Playlist[]>>('/playlists');
    return data.data;
  },

  async getPlaylist(id: string) {
    const { data } = await api.get<Envelope<Playlist>>(`/playlists/${id}`);
    return data.data;
  },

  async createPlaylist(name: string) {
    const { data } = await api.post<Envelope<Playlist>>('/playlists', { name, isPublic: true });
    return data.data;
  },

  async updatePlaylist(id: string, input: PlaylistInput) {
    const { data } = await api.patch<Envelope<Playlist>>(`/playlists/${id}`, input);
    return data.data;
  },

  async uploadPlaylistCover(id: string, file: File) {
    const form = new FormData();
    form.append('cover', file);
    const { data } = await api.post<Envelope<Playlist>>(`/playlists/${id}/cover`, form);
    return data.data;
  },

  async deletePlaylist(id: string) {
    await api.delete(`/playlists/${id}`);
  },

  async addTrack(playlistId: string, trackId: string) {
    await api.post(`/playlists/${playlistId}/tracks`, { trackId });
  },

  async removeTrack(playlistId: string, trackId: string) {
    await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
  },

  // ---- Favoritos ----
  async favorites() {
    const { data } = await api.get<Envelope<Track[]>>('/favorites');
    return data.data;
  },

  async toggleFavorite(trackId: string) {
    const { data } = await api.post<Envelope<{ favorited: boolean }>>(
      `/favorites/${trackId}/toggle`,
    );
    return data.data;
  },

  // ---- Histórico ----
  async history() {
    const { data } = await api.get<Envelope<Track[]>>('/history');
    return data.data;
  },

  async registerPlay(trackId: string) {
    await api.post('/history', { trackId });
  },
};
