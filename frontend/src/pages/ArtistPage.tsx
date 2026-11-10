import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Play } from 'lucide-react';
import { catalogService } from '@/services/catalogService';
import { usePlayerStore } from '@/store/playerStore';
import { Cover } from '@/components/common/Cover';
import { CardRow, MediaCard } from '@/components/cards/MediaCard';
import { TrackRow } from '@/components/common/TrackRow';
import { HeaderSkeleton, TrackRowSkeleton } from '@/components/common/Skeletons';
import { ErrorState } from '@/components/common/EmptyState';

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playQueue = usePlayerStore((s) => s.playQueue);

  const {
    data: artist,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => catalogService.getArtist(id!),
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
  if (isError || !artist)
    return <ErrorState message="Artista não encontrado." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-8 pb-4">
      {/* Banner: capa do artista, ou um gradiente gerado a partir do nome */}
      <div className="-mx-4 md:-mx-8">
        <Cover
          src={artist.coverUrl}
          title={artist.name}
          className="!aspect-auto h-40 w-full !rounded-none opacity-90 md:h-56"
        />
      </div>

      <div className="-mt-20 flex items-end gap-4 px-0 md:gap-6">
        <Cover
          src={artist.avatarUrl}
          title={artist.name}
          round
          className="h-28 w-28 shrink-0 ring-4 ring-base md:h-40 md:w-40"
        />
        <div className="min-w-0 pb-2">
          <p className="text-xs font-semibold uppercase text-muted">Artista</p>
          <div className="flex items-center gap-2">
            <h1 className="truncate text-3xl font-black md:text-5xl">{artist.name}</h1>
            {artist.verified && (
              <BadgeCheck className="shrink-0 text-accent" size={26} aria-label="Verificado" />
            )}
          </div>
        </div>
      </div>

      {artist.bio && <p className="max-w-2xl text-sm text-muted">{artist.bio}</p>}

      {artist.topTracks.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Populares</h2>
            <button
              onClick={() => playQueue(artist.topTracks, 0)}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-bold text-black hover:bg-accent-hover"
            >
              <Play size={14} fill="currentColor" /> Tocar
            </button>
          </div>
          <ol>
            {artist.topTracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index + 1} queue={artist.topTracks} />
            ))}
          </ol>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-bold">Álbuns</h2>
        {artist.albums.length === 0 ? (
          <p className="text-sm text-muted">Este artista ainda não lançou álbuns.</p>
        ) : (
          <CardRow>
            {artist.albums.map((album) => (
              <MediaCard
                key={album.id}
                title={album.title}
                subtitle={album.type}
                coverUrl={album.coverUrl}
                onClick={() => navigate(`/albums/${album.id}`)}
              />
            ))}
          </CardRow>
        )}
      </section>
    </div>
  );
}
