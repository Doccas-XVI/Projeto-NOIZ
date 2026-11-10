import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-black text-accent">404</p>
      <h1 className="text-xl font-bold">Essa página não existe</h1>
      <p className="max-w-sm text-sm text-muted">
        O link pode estar errado ou o conteúdo foi removido.
      </p>
      <Link
        to="/"
        className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-black hover:bg-accent-hover"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
