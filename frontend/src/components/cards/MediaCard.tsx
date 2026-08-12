interface MediaCardProps {
  title: string;
  subtitle?: string;
  coverUrl?: string | null;
  onClick?: () => void;
}

export function MediaCard({ title, subtitle, coverUrl, onClick }: MediaCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-40 shrink-0 rounded-xl bg-surface p-3 text-left transition hover:bg-white/10"
    >
      <div className="mb-3 aspect-square w-full overflow-hidden rounded-lg bg-base">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="skeleton h-full w-full" />
        )}
      </div>
      <p className="truncate text-sm font-medium">{title}</p>
      {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
    </button>
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="w-40 shrink-0 rounded-xl bg-surface p-3">
      <div className="skeleton mb-3 aspect-square w-full" />
      <div className="skeleton mb-2 h-3 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}
