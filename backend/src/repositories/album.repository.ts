import { prisma } from '@/config/database';
import type { CreateAlbumInput } from '@/dtos/catalog.dto';

export const albumRepository = {
  findById(id: string) {
    return prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: { orderBy: { createdAt: 'asc' }, include: { artist: true, album: true } },
      },
    });
  },

  belongsToArtist(id: string, artistId: string) {
    return prisma.album.findFirst({ where: { id, artistId } });
  },

  create(artistId: string, data: CreateAlbumInput & { coverUrl?: string }) {
    return prisma.album.create({ data: { ...data, artistId }, include: { artist: true } });
  },

  updateCover(id: string, coverUrl: string) {
    return prisma.album.update({ where: { id }, data: { coverUrl } });
  },

  delete(id: string) {
    return prisma.album.delete({ where: { id } });
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
