import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';

const schema = z.object({
  password: z
    .string()
    .min(8, 'Mínimo de 8 caracteres')
    .regex(/[A-Z]/, 'Inclua uma letra maiúscula')
    .regex(/[0-9]/, 'Inclua um número'),
});
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await authService.resetPassword(token, data.password);
      toast.success('Senha redefinida! Faça login com a nova senha.');
      navigate('/login');
    } catch {
      toast.error('Token inválido ou expirado. Solicite um novo link.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-8">
        <h1 className="mb-1 text-2xl font-bold text-accent">NOIZ</h1>
        <p className="mb-6 text-sm text-muted">Defina sua nova senha</p>

        {!token ? (
          <p className="text-sm text-red-400">
            Link inválido.{' '}
            <Link to="/forgot-password" className="text-accent">
              Solicite um novo
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('password')}
                type="password"
                placeholder="Nova senha"
                className="w-full rounded-lg bg-base px-4 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-accent"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-accent py-3 text-sm font-bold text-black hover:bg-accent-hover disabled:opacity-60"
            >
              {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
