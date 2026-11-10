import { prisma } from '@/config/database';

export const playlistRepository = {
  findById(id: string) {
    return prisma.playlist.findUnique({
      where: { id },
      include: {
        tracks: {
          orderBy: { position: 'asc' },
          include: { track: { include: { artist: true, album: true } } },
        },
      },
    });
  },

  findByUser(userId: string) {
    return prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tracks: true } } },
    });
  },

  belongsToUser(id: string, userId: string) {
    return prisma.playlist.findFirst({ where: { id, userId } });
  },

  create(userId: string, data: { name: string; description?: string; isPublic?: boolean }) {
    return prisma.playlist.create({
      data: { ...data, userId },
      include: { _count: { select: { tracks: true } } },
    });
  },

  update(id: string, data: { name?: string; description?: string; isPublic?: boolean }) {
    return prisma.playlist.update({
      where: { id },
      data,
      include: { _count: { select: { tracks: true } } },
    });
  },

  updateCover(id: string, coverUrl: string) {
    return prisma.playlist.update({ where: { id }, data: { coverUrl } });
  },

  delete(id: string) {
    return prisma.playlist.delete({ where: { id } });
  },

  hasTrack(playlistId: string, trackId: string) {
    return prisma.playlistTrack.findUnique({
      where: { playlistId_trackId: { playlistId, trackId } },
    });
  },

  async addTrack(playlistId: string, trackId: string) {
    const last = await prisma.playlistTrack.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
    });
    return prisma.playlistTrack.create({
      data: { playlistId, trackId, position: (last?.position ?? -1) + 1 },
    });
  },

  removeTrack(playlistId: string, trackId: string) {
    return prisma.playlistTrack.deleteMany({ where: { playlistId, trackId } });
  },
};
