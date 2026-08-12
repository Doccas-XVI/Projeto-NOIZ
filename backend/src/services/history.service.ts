import { historyRepository } from '@/repositories/history.repository';

export const historyService = {
  register(userId: string, trackId: string) {
    return historyRepository.register(userId, trackId);
  },
  recent(userId: string) {
    return historyRepository.recentByUser(userId);
  },
};
