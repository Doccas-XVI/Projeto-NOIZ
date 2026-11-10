export type UserRole = 'LISTENER' | 'ARTIST' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  verified: boolean;
}

export interface Album {
  id: string;
  title: string;
  coverUrl?: string | null;
  releaseDate?: string | null;
  type: 'ALBUM' | 'SINGLE' | 'EP';
  // Quando o álbum vem aninhado dentro de uma Track, o artista não é incluído
  artist?: Artist;
}

export interface Track {
  id: string;
  title: string;
  durationSec: number;
  fileUrl: string;
  coverUrl?: string | null;
  genre?: string | null;
  playsCount?: number;
  /** A API só preenche na lista de curtidas; o coração da UI usa o cache de favoritos. */
  isFavorite?: boolean;
  artist: Artist;
  album?: Album | null;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  isPublic: boolean;
  userId: string;
  trackCount: number;
  // Só vem preenchido no detalhe da playlist (GET /playlists/:id)
  tracks?: Track[];
}

export interface AlbumDetail extends Album {
  artist: Artist;
  tracks: Track[];
}

export interface ArtistDetail extends Artist {
  albums: Album[];
  topTracks: Track[];
}

/** Catálogo do próprio artista (GET /artists/me) */
export interface OwnCatalog extends Artist {
  albums: (Album & { trackCount: number })[];
  tracks: Track[];
}

export interface SearchResults {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
