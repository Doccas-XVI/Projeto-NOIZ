import { historyRepository } from '@/repositories/history.repository';

export const historyService = {
  async register(userId: string, trackId: string) {
    await historyRepository.register(userId, trackId);
  },

  /** Devolve só as músicas (Track[]), da mais recente para a mais antiga, sem repetição. */
  async recent(userId: string) {
    const rows = await historyRepository.recentByUser(userId);
    return rows.map((row) => row.track);
  },
};
