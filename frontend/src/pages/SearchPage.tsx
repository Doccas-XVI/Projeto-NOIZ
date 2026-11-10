import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { catalogService } from '@/services/catalogService';
import { useDebounce } from '@/hooks/useDebounce';
import { CardRow, CardRowSkeleton, MediaCard } from '@/components/cards/MediaCard';
import { TrackRow } from '@/components/common/TrackRow';
import { TrackRowSkeleton } from '@/components/common/Skeletons';
import { ErrorState } from '@/components/common/EmptyState';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 350); // espera parar de digitar antes de buscar
  const navigate = useNavigate();

  const enabled = debouncedQuery.length >= 2;
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => catalogService.search(debouncedQuery),
    enabled,
  });

  const hasResults =
    data && (data.tracks.length > 0 || data.albums.length > 0 || data.artists.length > 0);

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center gap-3 rounded-full bg-surface px-4 py-3 ring-1 ring-fg/10 focus-within:ring-accent">
        <SearchIcon size={18} className="text-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque por música, artista ou álbum"
          aria-label="Buscar"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      {!enabled && <p className="text-sm text-muted">Digite pelo menos 2 letras para buscar.</p>}

      {enabled && isFetching && !data && (
        <div className="space-y-8">
          <TrackRowSkeleton count={3} />
          <CardRowSkeleton count={4} />
        </div>
      )}

      {isError && <ErrorState onRetry={() => void refetch()} />}

      {enabled && data && hasResults && (
        <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {data.tracks.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-bold">Músicas</h2>
              <ol>
                {data.tracks.map((track) => (
                  <TrackRow key={track.id} track={track} queue={data.tracks} />
                ))}
              </ol>
            </section>
          )}

          {data.artists.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-bold">Artistas</h2>
              <CardRow>
                {data.artists.map((artist) => (
                  <MediaCard
                    key={artist.id}
                    round
                    title={artist.name}
                    subtitle="Artista"
                    coverUrl={artist.avatarUrl}
                    onClick={() => navigate(`/artists/${artist.id}`)}
                  />
                ))}
              </CardRow>
            </section>
          )}

          {data.albums.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Álbuns</h2>
              <CardRow>
                {data.albums.map((album) => (
                  <MediaCard
                    key={album.id}
                    title={album.title}
                    subtitle={album.artist?.name}
                    coverUrl={album.coverUrl}
                    onClick={() => navigate(`/albums/${album.id}`)}
                  />
                ))}
              </CardRow>
            </section>
          )}
        </div>
      )}

      {enabled && data && !hasResults && !isFetching && (
        <p className="text-sm text-muted">Nenhum resultado para "{debouncedQuery}".</p>
      )}
    </div>
  );
}
