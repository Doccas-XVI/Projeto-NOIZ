import { Heart, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavoritesQuery } from '@/hooks/useFavorites';
import { usePlayerStore } from '@/store/playerStore';
import { TrackRow } from '@/components/common/TrackRow';
import { TrackRowSkeleton } from '@/components/common/Skeletons';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { pluralize } from '@/utils/format';

export default function FavoritesPage() {
  const { data: tracks, isLoading, isError, refetch } = useFavoritesQuery();
  const playQueue = usePlayerStore((s) => s.playQueue);

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-end gap-4 md:gap-6">
        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent/30 text-black md:h-40 md:w-40">
          <Heart size={48} fill="currentColor" />
        </div>
        <div>
          <p className="text-xs uppercase text-muted">Playlist</p>
          <h1 className="text-3xl font-black md:text-5xl">Curtidas</h1>
          {tracks && (
            <p className="mt-2 text-sm text-muted">
              {pluralize(tracks.length, 'música', 'músicas')}
            </p>
          )}
        </div>
      </div>

      {tracks && tracks.length > 0 && (
        <button
          onClick={() => playQueue(tracks, 0)}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-black hover:bg-accent-hover"
        >
          <Play size={16} fill="currentColor" /> Tocar tudo
        </button>
      )}

      {isLoading && <TrackRowSkeleton />}
      {isError && <ErrorState onRetry={() => void refetch()} />}

      {tracks?.length === 0 && (
        <EmptyState
          title="Nenhuma música curtida ainda"
          description="Toque no coração de qualquer música para guardá-la aqui."
          action={
            <Link
              to="/search"
              className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-black hover:bg-accent-hover"
            >
              Buscar música
            </Link>
          }
        />
      )}

      {tracks && tracks.length > 0 && (
        <ol>
          {tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index + 1} queue={tracks} />
          ))}
        </ol>
      )}
    </div>
  );
}
