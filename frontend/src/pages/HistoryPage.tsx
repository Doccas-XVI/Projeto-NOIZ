import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { libraryService } from '@/services/libraryService';
import { TrackRow } from '@/components/common/TrackRow';
import { TrackRowSkeleton } from '@/components/common/Skeletons';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';

export default function HistoryPage() {
  const {
    data: tracks,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['history'],
    queryFn: libraryService.history,
  });

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-black md:text-3xl">Histórico</h1>
        <p className="text-sm text-muted">O que você ouviu por último, sem repetição.</p>
      </div>

      {isLoading && <TrackRowSkeleton />}
      {isError && <ErrorState onRetry={() => void refetch()} />}

      {tracks?.length === 0 && (
        <EmptyState
          title="Você ainda não ouviu nada"
          description="As músicas aparecem aqui depois de tocarem por alguns segundos."
          action={
            <Link
              to="/"
              className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-black hover:bg-accent-hover"
            >
              Explorar
            </Link>
          }
        />
      )}

      {tracks && tracks.length > 0 && (
        <ol>
          {tracks.map((track) => (
            <TrackRow key={track.id} track={track} queue={tracks} />
          ))}
        </ol>
      )}
    </div>
  );
}
