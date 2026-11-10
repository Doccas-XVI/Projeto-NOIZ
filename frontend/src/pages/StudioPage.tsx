import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { studioService } from '@/services/studioService';
import { useAuthStore } from '@/store/authStore';
import { UploadTrackForm } from '@/components/studio/UploadTrackForm';
import { CreateAlbumForm } from '@/components/studio/CreateAlbumForm';
import { TrackRow } from '@/components/common/TrackRow';
import { Cover } from '@/components/common/Cover';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { TrackRowSkeleton } from '@/components/common/Skeletons';
import { getErrorMessage } from '@/utils/errors';
import { pluralize } from '@/utils/format';

export default function StudioPage() {
  const role = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isArtist = role === 'ARTIST' || role === 'ADMIN';

  const {
    data: catalog,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['studio', 'me'],
    queryFn: studioService.myCatalog,
    enabled: isArtist,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['studio'] });
    void queryClient.invalidateQueries({ queryKey: ['tracks', 'trending'] });
    void queryClient.invalidateQueries({ queryKey: ['albums', 'recent'] });
  };

  const deleteTrack = useMutation({
    mutationFn: (id: string) => studioService.deleteTrack(id),
    onSuccess: () => {
      toast.success('Música excluída');
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteAlbum = useMutation({
    mutationFn: (id: string) => studioService.deleteAlbum(id),
    onSuccess: () => {
      toast.success('Álbum excluído (as músicas continuam como singles)');
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (!isArtist) {
    return (
      <div className="py-8">
        <EmptyState
          title="O Estúdio é só para artistas"
          description="Crie seu perfil de artista para enviar músicas e montar álbuns."
          action={
            <button
              onClick={() => navigate('/profile')}
              className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-black hover:bg-accent-hover"
            >
              Virar artista
            </button>
          }
        />
      </div>
    );
  }

  if (isError)
    return (
      <ErrorState message="Não consegui carregar seu catálogo." onRetry={() => void refetch()} />
    );

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-black md:text-3xl">Estúdio</h1>
        {catalog && (
          <p className="text-sm text-muted">
            {catalog.name} •{' '}
            <Link to={`/artists/${catalog.id}`} className="text-accent hover:underline">
              ver minha página pública
            </Link>
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UploadTrackForm albums={catalog?.albums ?? []} />
        <CreateAlbumForm />
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold">Meus álbuns</h2>
        {isLoading ? (
          <TrackRowSkeleton count={2} />
        ) : catalog?.albums.length === 0 ? (
          <p className="text-sm text-muted">Você ainda não criou álbuns.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {catalog?.albums.map((album) => (
              <li key={album.id} className="flex items-center gap-3 rounded-xl bg-surface p-3">
                <Cover src={album.coverUrl} title={album.title} className="h-14 w-14 shrink-0" />
                <Link to={`/albums/${album.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold hover:underline">{album.title}</p>
                  <p className="text-xs text-muted">
                    {album.type} • {pluralize(album.trackCount, 'música', 'músicas')}
                  </p>
                </Link>
                <button
                  onClick={() =>
                    window.confirm(
                      `Excluir o álbum "${album.title}"? As músicas dele continuam no ar como singles.`,
                    ) && deleteAlbum.mutate(album.id)
                  }
                  aria-label={`Excluir álbum ${album.title}`}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-fg/10 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Minhas músicas</h2>
        {isLoading ? (
          <TrackRowSkeleton />
        ) : catalog?.tracks.length === 0 ? (
          <p className="text-sm text-muted">
            Nenhuma música enviada ainda. Use o formulário acima.
          </p>
        ) : (
          <ol>
            {catalog?.tracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                queue={catalog.tracks}
                extraAction={
                  <button
                    onClick={() =>
                      window.confirm(`Excluir "${track.title}" definitivamente?`) &&
                      deleteTrack.mutate(track.id)
                    }
                    aria-label={`Excluir ${track.title}`}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-fg/10 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                }
              />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
