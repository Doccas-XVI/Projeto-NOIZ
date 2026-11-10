import { useEffect, useRef, useState } from 'react';
import { ListPlus, ListEnd, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAddToPlaylist, useCreatePlaylist, useMyPlaylists } from '@/hooks/usePlaylists';
import { usePlayerStore } from '@/store/playerStore';
import type { Track } from '@/types/domain';

/**
 * Menu "..." de uma música: adicionar à fila, adicionar a uma playlist
 * existente ou criar uma playlist nova já com a música.
 */
export function TrackMenu({ track }: { track: Track }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: playlists, isLoading } = useMyPlaylists();
  const addToPlaylist = useAddToPlaylist();
  const createPlaylist = useCreatePlaylist();
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  // Fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setCreating(false);
    setNewName('');
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const playlist = await createPlaylist.mutateAsync(name);
    addToPlaylist.mutate({ playlistId: playlist.id, trackId: track.id });
    close();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Mais opções"
        aria-expanded={open}
        className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-fg/10 hover:text-fg"
      >
        <ListPlus size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-60 rounded-xl border border-fg/10 bg-surface p-2 shadow-2xl">
          <button
            onClick={() => {
              addToQueue(track);
              toast.success('Adicionada à fila');
              close();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-fg/10"
          >
            <ListEnd size={16} /> Adicionar à fila
          </button>

          <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Adicionar à playlist
          </p>

          <div className="max-h-48 overflow-y-auto">
            {isLoading && <div className="skeleton m-2 h-8" />}
            {playlists?.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => {
                  addToPlaylist.mutate({ playlistId: playlist.id, trackId: track.id });
                  close();
                }}
                className="block w-full truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-fg/10"
              >
                {playlist.name}
              </button>
            ))}
            {playlists?.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted">Você ainda não tem playlists.</p>
            )}
          </div>

          {creating ? (
            <form onSubmit={handleCreate} className="mt-1 flex gap-2 px-1">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={100}
                placeholder="Nome da playlist"
                className="min-w-0 flex-1 rounded-lg bg-base px-3 py-2 text-sm outline-none ring-1 ring-fg/10 focus:ring-accent"
              />
              <button
                type="submit"
                className="rounded-lg bg-accent px-3 text-sm font-bold text-black"
              >
                OK
              </button>
            </form>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-accent hover:bg-fg/10"
            >
              <Plus size={16} /> Nova playlist
            </button>
          )}
        </div>
      )}
    </div>
  );
}
