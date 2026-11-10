import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/domain';
import { queryClient } from '@/lib/queryClient';
import { usePlayerStore } from '@/store/playerStore';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

/**
 * Zustand global para auth (não Context API): o token é lido em todo
 * request do axios interceptor, fora da árvore React — Context não
 * serviria bem aqui. `persist` guarda em localStorage para manter a
 * sessão entre reloads da página.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      updateUser: (partial) => set((s) => (s.user ? { user: { ...s.user, ...partial } } : s)),
      logout: () => {
        // Limpa TUDO que é da sessão anterior: cache de dados e fila do player.
        // Sem isso, o próximo usuário a logar veria por um instante as
        // playlists e favoritos de quem usou o navegador antes.
        queryClient.clear();
        usePlayerStore.getState().reset();
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    { name: 'noiz-auth' },
  ),
);
