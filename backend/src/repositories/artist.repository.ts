import { prisma } from '@/config/database';

export const artistRepository = {
  findById(id: string) {
    return prisma.artist.findUnique({
      where: { id },
      include: { albums: { orderBy: { releaseDate: 'desc' } } },
    });
  },

  findByUserId(userId: string) {
    return prisma.artist.findUnique({ where: { userId } });
  },

  create(data: { name: string; bio?: string; userId: string }) {
    return prisma.artist.create({ data });
  },

  updateImages(id: string, data: { avatarUrl?: string; coverUrl?: string }) {
    return prisma.artist.update({ where: { id }, data });
  },

  search(query: string) {
    return prisma.artist.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: 20,
    });
  },

  topTracks(artistId: string) {
    return prisma.track.findMany({
      where: { artistId },
      orderBy: { playsCount: 'desc' },
      take: 10,
      include: { artist: true, album: true },
    });
  },
};
