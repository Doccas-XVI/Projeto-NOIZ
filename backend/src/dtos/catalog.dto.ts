import { z } from 'zod';

export const createArtistSchema = z.object({
  name: z.string().trim().min(1).max(120),
  bio: z.string().trim().max(2000).optional(),
});

export const createAlbumSchema = z.object({
  title: z.string().trim().min(1).max(150),
  type: z.enum(['ALBUM', 'SINGLE', 'EP']).default('ALBUM'),
  releaseDate: z.coerce.date().optional(),
});

export const createTrackSchema = z.object({
  title: z.string().trim().min(1).max(150),
  albumId: z.string().uuid().optional(),
  genre: z.string().trim().max(60).optional(),
  durationSec: z.coerce.number().int().positive(),
});

export const updateTrackSchema = createTrackSchema.partial();

export type CreateArtistInput = z.infer<typeof createArtistSchema>;
export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type CreateTrackInput = z.infer<typeof createTrackSchema>;
