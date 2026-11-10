import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import type { AuthResponse } from '@/types/domain';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api/v1';

export const api = axios.create({ baseURL: API_URL });

// Injeta o access token em toda requisição autenticada
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Renova a sessão usando o refresh token.
 *
 * "Single-flight": se 5 requisições expirarem ao mesmo tempo, só UMA chamada de
 * refresh sai; as outras esperam a mesma Promise. Isso é essencial porque o
 * backend usa ROTAÇÃO (cada refresh token só vale uma vez) — sem isso, a segunda
 * chamada usaria um token já revogado, falharia, e o usuário seria deslogado
 * à toa.
 */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setSession } = useAuthStore.getState();
  if (!refreshToken) throw new Error('Sem refresh token');

  const { data } = await axios.post<{ data: AuthResponse }>(`${API_URL}/auth/refresh`, {
    refreshToken,
  });
  const session = data.data;
  setSession(session.user, session.accessToken, session.refreshToken);
  return session.accessToken;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: RetriableConfig | undefined = error.config;
    const isAuthRoute = original?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true; // evita loop infinito caso o refresh também falhe
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const token = await refreshPromise;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  },
);
