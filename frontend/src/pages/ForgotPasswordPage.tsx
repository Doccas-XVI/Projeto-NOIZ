import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';
import { AuthLayout, inputClass, primaryButtonClass } from '@/components/common/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Não foi possível enviar o e-mail agora. Tente novamente.'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout subtitle="Recuperar senha">
      {sent ? (
        <p className="text-sm">
          Se esse e-mail existir na nossa base, enviamos um link de recuperação. Confira sua caixa
          de entrada (e o spam).
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            className={inputClass}
          />
          <button type="submit" disabled={loading} className={`${primaryButtonClass} w-full`}>
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-accent">
          Voltar ao login
        </Link>
      </p>
    </AuthLayout>
  );
}
