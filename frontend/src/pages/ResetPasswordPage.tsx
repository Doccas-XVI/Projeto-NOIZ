import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';
import {
  AuthLayout,
  FieldError,
  inputClass,
  primaryButtonClass,
} from '@/components/common/AuthLayout';

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
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Token inválido ou expirado. Solicite um novo link.'));
    }
  }

  return (
    <AuthLayout subtitle="Defina sua nova senha">
      {!token ? (
        <p className="text-sm text-red-500">
          Link inválido.{' '}
          <Link to="/forgot-password" className="text-accent">
            Solicite um novo
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <input
              {...register('password')}
              type="password"
              autoComplete="new-password"
              placeholder="Nova senha"
              className={inputClass}
            />
            <FieldError message={errors.password?.message} />
          </div>
          <button type="submit" disabled={isSubmitting} className={`${primaryButtonClass} w-full`}>
            {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
