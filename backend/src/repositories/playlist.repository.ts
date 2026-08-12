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
    return prisma.playlist.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  belongsToUser(id: string, userId: string) {
    return prisma.playlist.findFirst({ where: { id, userId } });
  },

  create(userId: string, data: { name: string; description?: string; isPublic?: boolean }) {
    return prisma.playlist.create({ data: { ...data, userId } });
  },

  update(id: string, data: { name?: string; description?: string; isPublic?: boolean }) {
    return prisma.playlist.update({ where: { id }, data });
  },

  updateCover(id: string, coverUrl: string) {
    return prisma.playlist.update({ where: { id }, data: { coverUrl } });
  },

  delete(id: string) {
    return prisma.playlist.delete({ where: { id } });
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
