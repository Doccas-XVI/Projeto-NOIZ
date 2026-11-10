import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** Só deixa passar quem tem sessão; senão manda para o login. */
export function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Telas de login/cadastro: quem já está logado volta para o início. */
export function PublicOnlyRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return accessToken ? <Navigate to="/" replace /> : <Outlet />;
}
