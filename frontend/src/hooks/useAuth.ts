import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/utils/errors';

/**
 * Concentra a lógica de "efetuar login/cadastro" num único hook:
 * as páginas só chamam `login(...)` e leem `isPending` / `error`.
 * TanStack Query cuida de loading/erro; Zustand guarda o resultado.
 */
export function useAuth() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const logoutStore = useAuthStore((s) => s.logout);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken, data.refreshToken);
      navigate('/', { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Não foi possível entrar')),
  });

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      authService.register(name, email, password),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken, data.refreshToken);
      toast.success(`Bem-vindo(a) à NOIZ, ${data.user.name}!`);
      navigate('/', { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Não foi possível criar sua conta')),
  });

  const logout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) await authService.logout(refreshToken).catch(() => undefined);
    logoutStore(); // limpa sessão, cache de dados e fila do player
    navigate('/login', { replace: true });
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
