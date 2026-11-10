import { api } from './api';
import type { Album, Artist, AuthResponse, OwnCatalog, Track } from '@/types/domain';

type Envelope<T> = { data: T };

/** Área do artista: perfil, álbuns e uploads de música. */
export const studioService = {
  async myCatalog() {
    const { data } = await api.get<Envelope<OwnCatalog>>('/artists/me');
    return data.data;
  },

  /** Cria o perfil e devolve uma sessão nova (a role virou ARTIST). */
  async createArtist(name: string, bio?: string) {
    const { data } = await api.post<Envelope<AuthResponse & { artist: Artist }>>('/artists', {
      name,
      bio: bio || undefined,
    });
    return data.data;
  },

  async uploadArtistAvatar(file: File) {
    const form = new FormData();
    form.append('image', file);
    const { data } = await api.post<Envelope<Artist>>('/artists/me/avatar', form);
    return data.data;
  },

  async uploadArtistCover(file: File) {
    const form = new FormData();
    form.append('image', file);
    const { data } = await api.post<Envelope<Artist>>('/artists/me/cover', form);
    return data.data;
  },

  async createAlbum(form: FormData) {
    const { data } = await api.post<Envelope<Album>>('/albums', form);
    return data.data;
  },

  async deleteAlbum(id: string) {
    await api.delete(`/albums/${id}`);
  },

  /** `onProgress` recebe 0–100 enquanto o arquivo sobe (uploads de áudio demoram). */
  async uploadTrack(form: FormData, onProgress?: (percent: number) => void) {
    const { data } = await api.post<Envelope<Track>>('/tracks', form, {
      onUploadProgress: (event) => {
        if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    });
    return data.data;
  },

  async deleteTrack(id: string) {
    await api.delete(`/tracks/${id}`);
  },
};
