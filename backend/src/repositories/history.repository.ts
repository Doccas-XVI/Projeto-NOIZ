import { prisma } from '@/config/database';

export const historyRepository = {
  /**
   * Registra a reprodução e incrementa o contador da música na mesma
   * transação: ou os dois acontecem, ou nenhum (contador nunca diverge do histórico).
   */
  register(userId: string, trackId: string) {
    return prisma.$transaction([
      prisma.playHistory.create({ data: { userId, trackId } }),
      prisma.track.update({ where: { id: trackId }, data: { playsCount: { increment: 1 } } }),
    ]);
  },

  // Histórico "recente e sem repetição óbvia": pega os últimos registros e
  // deduplica por música (evita mostrar a mesma faixa 5x seguidas na lista).
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
