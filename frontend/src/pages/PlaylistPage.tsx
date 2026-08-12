import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Trash2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { catalogService } from '@/services/catalogService';
import { usePlayerStore } from '@/store/playerStore';

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const playQueue = usePlayerStore((s) => s.playQueue);

  const { data: playlist, isLoading } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => catalogService.getPlaylist(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => catalogService.deletePlaylist(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists', 'mine'] });
      toast.success('Playlist excluída');
      navigate('/library');
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: (trackId: string) => catalogService.toggleFavorite(trackId),
    onSuccess: (result) => toast.success(result.favorited ? 'Adicionada aos favoritos' : 'Removida dos favoritos'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 py-8">
        <div className="skeleton h-48 w-48" />
        <div className="skeleton h-6 w-64" />
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-end justify-between gap-6">
        <div className="flex items-end gap-6">
          <div className="h-48 w-48 shrink-0 overflow-hidden rounded-xl bg-surface">
            {playlist.coverUrl ? (
              <img src={playlist.coverUrl} alt={playlist.name} className="h-full w-full object-cover" />
            ) : (
              <div className="skeleton h-full w-full" />
            )}
          </div>
          <div>
            <p className="text-xs uppercase text-muted">Playlist</p>
            <h1 className="text-4xl font-black">{playlist.name}</h1>
            {playlist.description && <p className="mt-2 text-sm text-muted">{playlist.description}</p>}
          </div>
        </div>

        <button
          onClick={() => deleteMutation.mutate()}
          className="text-muted hover:text-red-400"
          aria-label="Excluir playlist"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {playlist.tracks.length > 0 && (
        <button
          onClick={() => playQueue(playlist.tracks, 0)}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-black hover:bg-accent-hover"
        >
          <Play size={16} /> Tocar tudo
        </button>
      )}

      <ol className="divide-y divide-white/5">
        {playlist.tracks.map((track, index) => (
          <li key={track.id} className="flex items-center gap-4 px-2 py-3 hover:bg-white/5">
            <span
              className="flex-1 cursor-pointer text-sm"
              onClick={() => playQueue(playlist.tracks, index)}
            >
              {track.title} <span className="text-muted">— {track.artist.name}</span>
            </span>
            <button
              onClick={() => favoriteMutation.mutate(track.id)}
              className="text-muted hover:text-accent"
              aria-label="Favoritar"
            >
              <Heart size={16} />
            </button>
          </li>
        ))}

        {playlist.tracks.length === 0 && (
          <p className="py-4 text-sm text-muted">
            Essa playlist ainda não tem músicas. Adicione a partir da busca.
          </p>
        )}
      </ol>
    </div>
  );
}
