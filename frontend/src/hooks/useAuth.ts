import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

/**
 * Concentra a lógica de "efetuar login/cadastro" num único hook:
 * as páginas só chamam `login(...)` e leem `isPending` / `error`.
 * TanStack Query cuida de loading/erro; Zustand guarda o resultado.
 */
export function useAuth() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const logoutStore = useAuthStore((s) => s.logout);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken, data.refreshToken);
      navigate('/');
    },
    onError: () => toast.error('E-mail ou senha inválidos'),
  });

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      authService.register(name, email, password),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken, data.refreshToken);
      toast.success(`Bem-vindo(a) à NOIZ, ${data.user.name}!`);
      navigate('/');
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível criar sua conta';
      toast.error(message);
    },
  });

  const logout = async () => {
    if (refreshToken) await authService.logout(refreshToken).catch(() => {});
    logoutStore();
    navigate('/login');
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
