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

// Mesmas regras do backend (src/dtos/auth.dto.ts): validar nos dois lados
// dá feedback imediato ao usuário e continua seguro mesmo se alguém burlar o front.
const schema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'Mínimo de 8 caracteres')
    .regex(/[A-Z]/, 'Inclua uma letra maiúscula')
    .regex(/[0-9]/, 'Inclua um número'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <AuthLayout subtitle="Cria sua conta e sobe o som.">
      <form onSubmit={handleSubmit((data) => registerUser(data))} className="space-y-4" noValidate>
        <div>
          <input
            {...register('name')}
            autoComplete="name"
            placeholder="Nome"
            className={inputClass}
          />
          <FieldError message={errors.name?.message} />
        </div>

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
            autoComplete="new-password"
            placeholder="Senha"
            className={inputClass}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <button type="submit" disabled={isRegistering} className={`${primaryButtonClass} w-full`}>
          {isRegistering ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-accent">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
