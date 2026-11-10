export function TrackRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2">
          <div className="skeleton h-10 w-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-3 w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex items-end gap-6 py-8">
      <div className="skeleton h-40 w-40 shrink-0 md:h-48 md:w-48" />
      <div className="flex-1 space-y-3">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-9 w-2/3" />
        <div className="skeleton h-3 w-24" />
      </div>
    </div>
  );
}
