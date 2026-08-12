import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { catalogService } from '@/services/catalogService';
import { usePlayerStore } from '@/store/playerStore';

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const playQueue = usePlayerStore((s) => s.playQueue);

  const { data: album, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: () => catalogService.getAlbum(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 py-8">
        <div className="skeleton h-48 w-48" />
        <div className="skeleton h-6 w-64" />
      </div>
    );
  }

  if (!album) return null;

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-end gap-6">
        <div className="h-48 w-48 shrink-0 overflow-hidden rounded-xl bg-surface">
          {album.coverUrl ? (
            <img src={album.coverUrl} alt={album.title} className="h-full w-full object-cover" />
          ) : (
            <div className="skeleton h-full w-full" />
          )}
        </div>
        <div>
          <p className="text-xs uppercase text-muted">{album.type}</p>
          <h1 className="text-4xl font-black">{album.title}</h1>
          <p className="mt-2 text-sm text-muted">{album.artist.name}</p>
        </div>
      </div>

      <button
        onClick={() => playQueue(album.tracks, 0)}
        className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-black hover:bg-accent-hover"
      >
        <Play size={16} /> Tocar tudo
      </button>

      <ol className="divide-y divide-white/5">
        {album.tracks.map((track, index) => (
          <li
            key={track.id}
            onClick={() => playQueue(album.tracks, index)}
            className="flex cursor-pointer items-center gap-4 px-2 py-3 hover:bg-white/5"
          >
            <span className="w-6 text-sm text-muted">{index + 1}</span>
            <span className="flex-1 text-sm">{track.title}</span>
            <span className="text-xs text-muted">
              {Math.floor(track.durationSec / 60)}:{String(track.durationSec % 60).padStart(2, '0')}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
