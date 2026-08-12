import { prisma } from '@/config/database';
import type { CreateAlbumInput } from '@/dtos/catalog.dto';

export const albumRepository = {
  findById(id: string) {
    return prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: { orderBy: { createdAt: 'asc' }, include: { artist: true } },
      },
    });
  },

  create(artistId: string, data: CreateAlbumInput & { coverUrl?: string }) {
    return prisma.album.create({ data: { ...data, artistId } });
  },

  updateCover(id: string, coverUrl: string) {
    return prisma.album.update({ where: { id }, data: { coverUrl } });
  },

  recent(take = 12) {
    return prisma.album.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: { artist: true },
    });
  },

  search(query: string) {
    return prisma.album.findMany({
      where: { title: { contains: query, mode: 'insensitive' } },
      include: { artist: true },
      take: 20,
    });
  },
};
