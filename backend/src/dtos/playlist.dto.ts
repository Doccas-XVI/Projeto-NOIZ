import { z } from 'zod';

export const createPlaylistSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  isPublic: z.boolean().default(true),
});

export const updatePlaylistSchema = createPlaylistSchema.partial();

export const addTrackToPlaylistSchema = z.object({
  trackId: z.string().uuid(),
});

export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;
