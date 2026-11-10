import { useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Check, Globe, Lock, Pencil, Play, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { libraryService, type PlaylistInput } from '@/services/libraryService';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { PLAYLISTS_KEY } from '@/hooks/usePlaylists';
import { Cover } from '@/components/common/Cover';
import { TrackRow } from '@/components/common/TrackRow';
import { HeaderSkeleton, TrackRowSkeleton } from '@/components/common/Skeletons';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { getErrorMessage } from '@/utils/errors';
import { pluralize } from '@/utils/format';
import type { Playlist } from '@/types/domain';

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(
    Boolean((location.state as { editing?: boolean } | null)?.editing),
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const queryKey = ['playlist', id] as const;
  const {
    data: playlist,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => libraryService.getPlaylist(id!),
    enabled: !!id,
  });

  // Respostas de update/capa não trazem as músicas: mesclamos no cache sem perdê-las
  function mergeIntoCache(updated: Partial<Playlist>) {
    queryClient.setQueryData<Playlist>(queryKey, (old) =>
      old ? { ...old, ...updated, tracks: old.tracks } : old,
    );
    void queryClient.invalidateQueries({ queryKey: PLAYLISTS_KEY });
  }

  const updateMutation = useMutation({
    mutationFn: (input: PlaylistInput) => libraryService.updatePlaylist(id!, input),
    onSuccess: (updated) => {
      mergeIntoCache(updated);
      setEditing(false);
      toast.success('Playlist atualizada');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const coverMutation = useMutation({
    mutationFn: (file: File) => libraryService.uploadPlaylistCover(id!, file),
    onSuccess: (updated) => {
      mergeIntoCache(updated);
      toast.success('Capa atualizada');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => libraryService.deletePlaylist(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLAYLISTS_KEY });
      queryClient.removeQueries({ queryKey });
      toast.success('Playlist excluída');
      navigate('/library', { replace: true });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const removeTrackMutation = useMutation({
    mutationFn: (trackId: string) => libraryService.removeTrack(id!, trackId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: PLAYLISTS_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (isLoading) {
    return (
      <>
        <HeaderSkeleton />
        <TrackRowSkeleton />
      </>
    );
  }
  if (isError || !playlist)
    return <ErrorState message="Playlist não encontrada." onRetry={() => void refetch()} />;

  const isOwner = playlist.userId === userId;
  const tracks = playlist.tracks ?? [];

  function startEditing() {
    setName(playlist!.name);
    setDescription(playlist!.description ?? '');
    setEditing(true);
  }

  function saveEdits(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return toast.error('A playlist precisa de um nome');
    updateMutation.mutate({ name: trimmed, description: description.trim() });
  }

  function handleDelete() {
    if (
      window.confirm(`Excluir a playlist "${playlist!.name}"? Essa ação não pode ser desfeita.`)
    ) {
      deleteMutation.mutate();
    }
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end md:gap-6">
        <div className="relative shrink-0">
          <Cover
            src={playlist.coverUrl}
            title={playlist.name}
            className="h-40 w-40 shadow-xl md:h-52 md:w-52"
          />
          {isOwner && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={coverMutation.isPending}
                aria-label="Trocar capa"
                className="absolute inset-0 grid place-items-center rounded-lg bg-black/60 text-white opacity-0 transition hover:opacity-100 focus-visible:opacity-100"
              >
                <Camera size={28} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) coverMutation.mutate(file);
                  e.target.value = '';
                }}
              />
            </>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase text-muted">Playlist</p>

          {editing ? (
            <form onSubmit={saveEdits} className="mt-1 space-y-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                aria-label="Nome da playlist"
                className="w-full rounded-lg bg-surface px-3 py-2 text-2xl font-black outline-none ring-1 ring-fg/15 focus:ring-accent md:text-4xl"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Descrição (opcional)"
                aria-label="Descrição"
                className="w-full resize-none rounded-lg bg-surface px-3 py-2 text-sm outline-none ring-1 ring-fg/15 placeholder:text-muted focus:ring-accent"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm font-bold text-black hover:bg-accent-hover disabled:opacity-60"
                >
                  <Check size={16} /> Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-fg"
                >
                  <X size={16} /> Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="break-words text-3xl font-black md:text-5xl">{playlist.name}</h1>
              {playlist.description && (
                <p className="mt-2 text-sm text-muted">{playlist.description}</p>
              )}
              <p className="mt-2 text-sm text-muted">
                {pluralize(tracks.length, 'música', 'músicas')} •{' '}
                {playlist.isPublic ? 'Pública' : 'Privada'}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {tracks.length > 0 && (
          <button
            onClick={() => playQueue(tracks, 0)}
            className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-black hover:bg-accent-hover"
          >
            <Play size={16} fill="currentColor" /> Tocar tudo
          </button>
        )}

        {isOwner && !editing && (
          <>
            <button
              onClick={startEditing}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-fg"
            >
              <Pencil size={16} /> Editar
            </button>
            <button
              onClick={() => updateMutation.mutate({ isPublic: !playlist.isPublic })}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-fg"
            >
              {playlist.isPublic ? <Lock size={16} /> : <Globe size={16} />}
              Tornar {playlist.isPublic ? 'privada' : 'pública'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-red-500"
            >
              <Trash2 size={16} /> Excluir
            </button>
          </>
        )}
      </div>

      {tracks.length === 0 ? (
        <EmptyState
          title="Essa playlist ainda está vazia"
          description="Use o botão de lista ao lado de qualquer música para adicioná-la aqui."
        />
      ) : (
        <ol>
          {tracks.map((track, index) => (
            <TrackRow
              key={track.id}
              track={track}
              index={index + 1}
              queue={tracks}
              extraAction={
                isOwner && (
                  <button
                    onClick={() => removeTrackMutation.mutate(track.id)}
                    aria-label={`Remover ${track.title} da playlist`}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-fg/10 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                )
              }
            />
          ))}
        </ol>
      )}
    </div>
  );
}
