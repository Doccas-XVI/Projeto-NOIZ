import { favoriteRepository } from '@/repositories/favorite.repository';

export const favoriteService = {
  list(userId: string) {
    return favoriteRepository.findByUser(userId);
  },

  /**
   * Toggle: se já favoritou, desfavorita; senão, favorita.
   * Poupa o frontend de checar estado antes de chamar — um único
   * endpoint resolve os dois casos, coerente com o coração de "curtir".
   */
  async toggle(userId: string, trackId: string) {
    const existing = await favoriteRepository.exists(userId, trackId);
    if (existing) {
      await favoriteRepository.remove(userId, trackId);
      return { favorited: false };
    }
    await favoriteRepository.create(userId, trackId);
    return { favorited: true };
  },
};
