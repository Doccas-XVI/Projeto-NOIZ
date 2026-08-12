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
  artist: Artist;
}

export interface Track {
  id: string;
  title: string;
  durationSec: number;
  fileUrl: string;
  coverUrl?: string | null;
  artist: Artist;
  album?: Album | null;
  isFavorite?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  isPublic: boolean;
  tracks: Track[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
