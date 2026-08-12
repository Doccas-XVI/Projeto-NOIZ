import { prisma } from '@/config/database';

export const favoriteRepository = {
  findByUser(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { track: { include: { artist: true, album: true } } },
    });
  },

  exists(userId: string, trackId: string) {
    return prisma.favorite.findUnique({ where: { userId_trackId: { userId, trackId } } });
  },

  create(userId: string, trackId: string) {
    return prisma.favorite.create({ data: { userId, trackId } });
  },

  remove(userId: string, trackId: string) {
    return prisma.favorite.delete({ where: { userId_trackId: { userId, trackId } } });
  },
};
