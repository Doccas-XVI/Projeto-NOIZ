import { favoriteRepository } from '@/repositories/favorite.repository';

export const favoriteService = {
  /** Devolve só as músicas (Track[]), da mais recente curtida para a mais antiga. */
  async list(userId: string) {
    const favorites = await favoriteRepository.findByUser(userId);
    return favorites.map((favorite) => ({ ...favorite.track, isFavorite: true }));
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
