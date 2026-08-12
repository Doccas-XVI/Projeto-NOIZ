import { api } from './api';
import type { Album, Artist, Playlist, Track } from '@/types/domain';

export const catalogService = {
  async recentAlbums() {
    const { data } = await api.get<{ data: Album[] }>('/albums/recent');
    return data.data;
  },

  async getAlbum(id: string) {
    const { data } = await api.get<{ data: Album & { tracks: Track[] } }>(`/albums/${id}`);
    return data.data;
  },

  async getArtist(id: string) {
    const { data } = await api.get<{ data: Artist & { albums: Album[] } }>(`/artists/${id}`);
    return data.data;
  },

  async search(query: string) {
    const { data } = await api.get<{ data: { tracks: Track[]; albums: Album[]; artists: Artist[] } }>(
      '/search',
      { params: { q: query } },
    );
    return data.data;
  },

  async myPlaylists() {
    const { data } = await api.get<{ data: Playlist[] }>('/playlists');
    return data.data;
  },

  async getPlaylist(id: string) {
    const { data } = await api.get<{ data: Playlist }>(`/playlists/${id}`);
    return data.data;
  },

  async createPlaylist(name: string) {
    const { data } = await api.post<{ data: Playlist }>('/playlists', { name, isPublic: true });
    return data.data;
  },

  async deletePlaylist(id: string) {
    await api.delete(`/playlists/${id}`);
  },

  async toggleFavorite(trackId: string) {
    const { data } = await api.post<{ data: { favorited: boolean } }>(
      `/favorites/${trackId}/toggle`,
    );
    return data.data;
  },
};
