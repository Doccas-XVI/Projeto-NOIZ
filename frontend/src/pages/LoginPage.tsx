import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  AuthLayout,
  FieldError,
  inputClass,
  primaryButtonClass,
} from '@/components/common/AuthLayout';

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
    <AuthLayout subtitle="Entra e toca o seu corre.">
      <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4" noValidate>
        <div>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="E-mail"
            className={inputClass}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            placeholder="Senha"
            className={inputClass}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <Link to="/forgot-password" className="block text-xs text-muted hover:text-accent">
          Esqueci minha senha
        </Link>

        <button type="submit" disabled={isLoggingIn} className={`${primaryButtonClass} w-full`}>
          {isLoggingIn ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Não tem conta?{' '}
        <Link to="/register" className="font-semibold text-accent">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  );
}
