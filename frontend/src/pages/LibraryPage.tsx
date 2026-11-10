import { Plus, Heart, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreatePlaylist, useMyPlaylists } from '@/hooks/usePlaylists';
import { MediaCard, MediaCardSkeleton } from '@/components/cards/MediaCard';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { pluralize } from '@/utils/format';

export default function LibraryPage() {
  const navigate = useNavigate();
  const { data: playlists, isLoading, isError, refetch } = useMyPlaylists();
  const createPlaylist = useCreatePlaylist();

  async function handleCreate() {
    const playlist = await createPlaylist.mutateAsync('Nova playlist');
    // abre já no modo de edição para o usuário dar o nome
    navigate(`/playlists/${playlist.id}`, { state: { editing: true } });
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-black md:text-3xl">Sua biblioteca</h1>
        <button
          onClick={handleCreate}
          disabled={createPlaylist.isPending}
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-black hover:bg-accent-hover disabled:opacity-60"
        >
          <Plus size={16} /> Nova playlist
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/favorites"
          className="flex items-center gap-3 rounded-xl bg-surface p-4 hover:bg-fg/10"
        >
          <Heart className="text-accent" fill="currentColor" />{' '}
          <span className="font-semibold">Curtidas</span>
        </Link>
        <Link
          to="/history"
          className="flex items-center gap-3 rounded-xl bg-surface p-4 hover:bg-fg/10"
        >
          <Clock className="text-accent" /> <span className="font-semibold">Histórico</span>
        </Link>
      </div>

      <h2 className="text-lg font-bold">Suas playlists</h2>

      {isError && <ErrorState onRetry={() => void refetch()} />}

      <div className="flex flex-wrap gap-3 md:gap-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <MediaCardSkeleton key={i} />)}

        {playlists?.map((playlist) => (
          <MediaCard
            key={playlist.id}
            title={playlist.name}
            subtitle={pluralize(playlist.trackCount, 'música', 'músicas')}
            coverUrl={playlist.coverUrl}
            onClick={() => navigate(`/playlists/${playlist.id}`)}
          />
        ))}
      </div>

      {playlists?.length === 0 && (
        <EmptyState
          title="Você ainda não tem playlists"
          description="Crie a primeira e comece a montar o seu corre."
        />
      )}
    </div>
  );
}
