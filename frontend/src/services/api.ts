import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Injeta o access token em toda requisição autenticada
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Se o access token expirou (401), tenta renovar automaticamente com
 * o refresh token antes de desistir. Isso evita deslogar o usuário
 * a cada 15 minutos por conta da vida curta do access token.
 * `_retry` evita loop infinito caso o refresh também falhe.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config: { _retry?: boolean } }) => {
    const original = error.config;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
            refreshToken,
          });
          useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          useAuthStore.getState().logout();
        }
      } else {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  },
);
