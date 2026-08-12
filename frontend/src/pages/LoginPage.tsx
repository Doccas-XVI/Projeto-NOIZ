import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Digite sua senha'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-8">
        <h1 className="mb-1 text-2xl font-bold text-accent">NOIZ</h1>
        <p className="mb-6 text-sm text-muted">Entra e toca o seu corre.</p>

        <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4">
          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="E-mail"
              className="w-full rounded-lg bg-base px-4 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-accent"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <input
              {...register('password')}
              type="password"
              placeholder="Senha"
              className="w-full rounded-lg bg-base px-4 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-accent"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <Link to="/forgot-password" className="block text-xs text-muted hover:text-accent">
            Esqueci minha senha
          </Link>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-full bg-accent py-3 text-sm font-bold text-black transition hover:bg-accent-hover disabled:opacity-60"
          >
            {isLoggingIn ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Não tem conta?{' '}
          <Link to="/register" className="font-semibold text-accent">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
