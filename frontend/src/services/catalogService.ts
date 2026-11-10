import { api } from './api';
import type { Album, AlbumDetail, ArtistDetail, SearchResults, Track } from '@/types/domain';

type Envelope<T> = { data: T };

export const catalogService = {
  async recentAlbums() {
    const { data } = await api.get<Envelope<Album[]>>('/albums/recent');
    return data.data;
  },

  async trendingTracks() {
    const { data } = await api.get<Envelope<Track[]>>('/tracks/trending');
    return data.data;
  },

  async getAlbum(id: string) {
    const { data } = await api.get<Envelope<AlbumDetail>>(`/albums/${id}`);
    return data.data;
  },

  async getArtist(id: string) {
    const { data } = await api.get<Envelope<ArtistDetail>>(`/artists/${id}`);
    return data.data;
  },

  async search(query: string) {
    const { data } = await api.get<Envelope<SearchResults>>('/search', { params: { q: query } });
    return data.data;
  },
};
