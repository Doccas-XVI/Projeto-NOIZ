import { prisma } from '@/config/database';

export const historyRepository = {
  register(userId: string, trackId: string) {
    return prisma.playHistory.create({ data: { userId, trackId } });
  },

  // Histórico "recente e sem repetição óbvia": pega os últimos N registros
  // distintos por música (evita mostrar a mesma faixa 5x seguidas na lista).
  async recentByUser(userId: string, take = 30) {
    const rows = await prisma.playHistory.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: take * 3, // margem para deduplicar
      include: { track: { include: { artist: true, album: true } } },
    });

    const seen = new Set<string>();
    const unique = [];
    for (const row of rows) {
      if (seen.has(row.trackId)) continue;
      seen.add(row.trackId);
      unique.push(row);
      if (unique.length >= take) break;
    }
    return unique;
  },
};
