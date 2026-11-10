import { prisma } from '@/config/database';
import type { CreateTrackInput } from '@/dtos/catalog.dto';

export const trackRepository = {
  findById(id: string) {
    return prisma.track.findUnique({
      where: { id },
      include: { artist: true, album: true },
    });
  },

  create(artistId: string, data: CreateTrackInput & { fileUrl: string; coverUrl?: string }) {
    return prisma.track.create({
      data: { ...data, artistId },
      include: { artist: true, album: true },
    });
  },

  update(id: string, data: Partial<CreateTrackInput>) {
    return prisma.track.update({ where: { id }, data, include: { artist: true, album: true } });
  },

  delete(id: string) {
    return prisma.track.delete({ where: { id } });
  },

  /** Músicas mais tocadas da plataforma (para a Home). */
  trending(take = 12) {
    return prisma.track.findMany({
      orderBy: [{ playsCount: 'desc' }, { createdAt: 'desc' }],
      take,
      include: { artist: true, album: true },
    });
  },

  search(query: string) {
    return prisma.track.findMany({
      where: { title: { contains: query, mode: 'insensitive' } },
      include: { artist: true, album: true },
      take: 20,
    });
  },

  belongsToArtist(trackId: string, artistId: string) {
    return prisma.track.findFirst({ where: { id: trackId, artistId } });
  },
};
