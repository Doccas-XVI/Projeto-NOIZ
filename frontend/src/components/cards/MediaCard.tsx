import clsx from 'clsx';
import { Cover } from '@/components/common/Cover';

interface MediaCardProps {
  title: string;
  subtitle?: string;
  coverUrl?: string | null;
  round?: boolean;
  onClick?: () => void;
}

export function MediaCard({ title, subtitle, coverUrl, round, onClick }: MediaCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-36 shrink-0 rounded-xl bg-surface p-3 text-left transition hover:bg-fg/10 md:w-40"
    >
      <Cover src={coverUrl} title={title} round={round} className="mb-3 w-full" />
      <p className={clsx('truncate text-sm font-medium', round && 'text-center')}>{title}</p>
      {subtitle && (
        <p className={clsx('truncate text-xs text-muted', round && 'text-center')}>{subtitle}</p>
      )}
    </button>
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="w-36 shrink-0 rounded-xl bg-surface p-3 md:w-40">
      <div className="skeleton mb-3 aspect-square w-full" />
      <div className="skeleton mb-2 h-3 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}

/** Faixa horizontal rolável de cards (Home, Busca, Artista...). */
export function CardRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-3 overflow-x-auto pb-2 md:gap-4">{children}</div>;
}

export function CardRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <CardRow>
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </CardRow>
  );
}
