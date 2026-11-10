import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-fg/15 px-6 py-12 text-center">
      <p className="font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      title="Não deu pra carregar"
      description={message ?? 'Confira se o servidor está rodando e tente de novo.'}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-black hover:bg-accent-hover"
          >
            Tentar de novo
          </button>
        )
      }
    />
  );
}
