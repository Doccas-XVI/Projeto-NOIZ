import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { catalogService } from '@/services/catalogService';
import { usePlayerStore } from '@/store/playerStore';
import { Cover } from '@/components/common/Cover';
import { TrackRow } from '@/components/common/TrackRow';
import { HeaderSkeleton, TrackRowSkeleton } from '@/components/common/Skeletons';
import { ErrorState } from '@/components/common/EmptyState';
import { formatTime, pluralize } from '@/utils/format';

const TYPE_LABEL = { ALBUM: 'Álbum', SINGLE: 'Single', EP: 'EP' } as const;

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const playQueue = usePlayerStore((s) => s.playQueue);

  const {
    data: album,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['album', id],
    queryFn: () => catalogService.getAlbum(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <>
        <HeaderSkeleton />
        <TrackRowSkeleton />
      </>
    );
  }
  if (isError || !album)
    return <ErrorState message="Álbum não encontrado." onRetry={() => void refetch()} />;

  const totalSec = album.tracks.reduce((sum, track) => sum + track.durationSec, 0);
  const year = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;

  return (
    <div className="space-y-6 py-4 md:py-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end md:gap-6">
        <Cover
          src={album.coverUrl}
          title={album.title}
          className="h-40 w-40 shrink-0 shadow-xl md:h-52 md:w-52"
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-muted">{TYPE_LABEL[album.type]}</p>
          <h1 className="text-3xl font-black md:text-5xl">{album.title}</h1>
          <p className="mt-2 text-sm text-muted">
            <Link
              to={`/artists/${album.artist.id}`}
              className="font-semibold text-fg hover:underline"
            >
              {album.artist.name}
            </Link>
            {year && ` • ${year}`} • {pluralize(album.tracks.length, 'música', 'músicas')}
            {totalSec > 0 && `, ${formatTime(totalSec)}`}
          </p>
        </div>
      </div>

      {album.tracks.length > 0 && (
        <button
          onClick={() => playQueue(album.tracks, 0)}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-black hover:bg-accent-hover"
        >
          <Play size={16} fill="currentColor" /> Tocar tudo
        </button>
      )}

      <ol>
        {album.tracks.map((track, index) => (
          <TrackRow key={track.id} track={track} index={index + 1} queue={album.tracks} />
        ))}
      </ol>

      {album.tracks.length === 0 && (
        <p className="text-sm text-muted">Este álbum ainda não tem músicas.</p>
      )}
    </div>
  );
}
