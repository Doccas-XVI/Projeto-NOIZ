import clsx from 'clsx';
import { Heart, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Cover } from '@/components/common/Cover';
import { TrackMenu } from '@/components/common/TrackMenu';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/useFavorites';
import { usePlayerStore, selectCurrentTrack } from '@/store/playerStore';
import { formatTime, trackCover } from '@/utils/format';
import type { Track } from '@/types/domain';

interface TrackRowProps {
  track: Track;
  /** posição (1, 2, 3...) mostrada à esquerda; sem ela, mostra a capa */
  index?: number;
  /** fila inteira de onde a música veio — tocar uma continua pela lista toda */
  queue: Track[];
  /** ação extra à direita (ex: remover da playlist) */
  extraAction?: React.ReactNode;
}

/** Linha de música reutilizada em álbum, playlist, busca, curtidas, histórico e artista. */
export function TrackRow({ track, index, queue, extraAction }: TrackRowProps) {
  const playQueue = usePlayerStore((s) => s.playQueue);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const current = usePlayerStore(selectCurrentTrack);
  const isPlayingNow = usePlayerStore((s) => s.isPlaying);

  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const isCurrent = current?.id === track.id;
  const isFavorite = favoriteIds.has(track.id);

  function handlePlay() {
    if (isCurrent) togglePlay();
    else
      playQueue(
        queue,
        Math.max(
          0,
          queue.findIndex((t) => t.id === track.id),
        ),
      );
  }

  return (
    <li className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-fg/5">
      <button
        onClick={handlePlay}
        aria-label={isCurrent && isPlayingNow ? `Pausar ${track.title}` : `Tocar ${track.title}`}
        className="relative grid h-10 w-10 shrink-0 place-items-center"
      >
        {index === undefined ? (
          <Cover src={trackCover(track)} title={track.title} className="h-10 w-10" />
        ) : (
          <span className={clsx('text-sm tabular-nums', isCurrent ? 'text-accent' : 'text-muted')}>
            {index}
          </span>
        )}
        <span
          className={clsx(
            'absolute inset-0 grid place-items-center rounded-lg bg-black/60 text-white',
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            index !== undefined && 'bg-base/80 text-accent',
          )}
        >
          {isCurrent && isPlayingNow ? <Pause size={16} /> : <Play size={16} />}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <p className={clsx('truncate text-sm font-medium', isCurrent && 'text-accent')}>
          {track.title}
        </p>
        <Link
          to={`/artists/${track.artist.id}`}
          className="truncate text-xs text-muted hover:text-fg hover:underline"
        >
          {track.artist.name}
        </Link>
      </div>

      <button
        onClick={() => toggleFavorite.mutate(track)}
        aria-label={isFavorite ? 'Remover das curtidas' : 'Curtir'}
        aria-pressed={isFavorite}
        className={clsx(
          'grid h-8 w-8 place-items-center rounded-full hover:bg-fg/10',
          isFavorite ? 'text-accent' : 'text-muted hover:text-fg',
        )}
      >
        <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      <TrackMenu track={track} />
      {extraAction}

      <span className="hidden w-12 text-right text-xs tabular-nums text-muted sm:block">
        {formatTime(track.durationSec)}
      </span>
    </li>
  );
}
