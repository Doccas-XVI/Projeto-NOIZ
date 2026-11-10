import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { catalogService } from '@/services/catalogService';
import { libraryService } from '@/services/libraryService';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { CardRow, CardRowSkeleton, MediaCard } from '@/components/cards/MediaCard';
import { TrackRow } from '@/components/common/TrackRow';
import { TrackRowSkeleton } from '@/components/common/Skeletons';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { trackCover } from '@/utils/format';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Boa madrugada';
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const playQueue = usePlayerStore((s) => s.playQueue);

  const history = useQuery({ queryKey: ['history'], queryFn: libraryService.history });
  const trending = useQuery({
    queryKey: ['tracks', 'trending'],
    queryFn: catalogService.trendingTracks,
  });
  const albums = useQuery({ queryKey: ['albums', 'recent'], queryFn: catalogService.recentAlbums });

  const firstName = user?.name.split(' ')[0];
  const catalogIsEmpty =
    trending.isSuccess &&
    albums.isSuccess &&
    trending.data.length === 0 &&
    albums.data.length === 0;

  if (trending.isError && albums.isError) {
    return (
      <div className="py-8">
        <ErrorState
          onRetry={() => {
            void trending.refetch();
            void albums.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      <h1 className="text-2xl font-black md:text-3xl">
        {greeting()}, {firstName} 🎧
      </h1>

      {catalogIsEmpty && (
        <EmptyState
          title="Ainda não tem música por aqui"
          description="O catálogo está vazio. Se você é artista, envie a primeira faixa pelo Estúdio."
          action={
            <Link
              to={user?.role === 'LISTENER' ? '/profile' : '/studio'}
              className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-black hover:bg-accent-hover"
            >
              {user?.role === 'LISTENER' ? 'Virar artista' : 'Ir para o Estúdio'}
            </Link>
          }
        />
      )}

      {history.data && history.data.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Tocadas recentemente</h2>
          <CardRow>
            {history.data.slice(0, 10).map((track, index) => (
              <MediaCard
                key={track.id}
                title={track.title}
                subtitle={track.artist.name}
                coverUrl={trackCover(track)}
                onClick={() => playQueue(history.data, index)}
              />
            ))}
          </CardRow>
        </section>
      )}

      {(trending.isLoading || (trending.data && trending.data.length > 0)) && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Em alta no NOIZ</h2>
          {trending.isLoading ? (
            <TrackRowSkeleton />
          ) : (
            <ol>
              {trending.data?.slice(0, 8).map((track, index) => (
                <TrackRow key={track.id} track={track} index={index + 1} queue={trending.data} />
              ))}
            </ol>
          )}
        </section>
      )}

      {(albums.isLoading || (albums.data && albums.data.length > 0)) && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Lançamentos</h2>
          {albums.isLoading ? (
            <CardRowSkeleton />
          ) : (
            <CardRow>
              {albums.data?.map((album) => (
                <MediaCard
                  key={album.id}
                  title={album.title}
                  subtitle={album.artist?.name}
                  coverUrl={album.coverUrl}
                  onClick={() => navigate(`/albums/${album.id}`)}
                />
              ))}
            </CardRow>
          )}
        </section>
      )}
    </div>
  );
}
