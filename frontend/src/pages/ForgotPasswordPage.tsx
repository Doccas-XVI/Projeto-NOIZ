import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Não foi possível enviar o e-mail agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-8">
        <h1 className="mb-1 text-2xl font-bold text-accent">NOIZ</h1>
        <p className="mb-6 text-sm text-muted">Recuperar senha</p>

        {sent ? (
          <p className="text-sm text-white">
            Se esse e-mail existir na nossa base, enviamos um link de recuperação. Confira sua caixa de entrada.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="w-full rounded-lg bg-base px-4 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-accent py-3 text-sm font-bold text-black hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link to="/login" className="font-semibold text-accent">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
