import { QueryClient } from '@tanstack/react-query';

// Uma instância única do app. Fica fora de App.tsx para que o logout (store)
// consiga limpar o cache e não vazar dados de um usuário para o próximo.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 30, refetchOnWindowFocus: false },
  },
});
