import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
} from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { usePlayerStore, selectCurrentTrack } from '@/store/playerStore';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/useFavorites';
import { Cover } from '@/components/common/Cover';
import { formatTime, trackCover } from '@/utils/format';

/**
 * Barra do player (rodapé). Só desenha e dispara ações do store —
 * o som em si é tocado pelo <AudioEngine />.
 */
export function PlayerBar() {
  const track = usePlayerStore(selectCurrentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progressSec = usePlayerStore((s) => s.progressSec);
  const durationFromAudio = usePlayerStore((s) => s.durationSec);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const {
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
  } = usePlayerStore.getState();

  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  // Sem música na fila: mostra a barra "vazia" em vez de esconder — mantém o layout estável
  if (!track) {
    return (
      <footer className="flex h-16 items-center justify-center border-t border-fg/10 bg-surface px-4 text-sm text-muted md:h-20">
        Escolha uma música para começar a ouvir
      </footer>
    );
  }

  const duration = durationFromAudio || track.durationSec;
  const isFavorite = favoriteIds.has(track.id);
  const percent = duration > 0 ? Math.min(100, (progressSec / duration) * 100) : 0;

  return (
    <footer className="border-t border-fg/10 bg-surface">
      {/* Mobile: barra de progresso fininha no topo */}
      <div className="h-0.5 w-full bg-fg/10 md:hidden" aria-hidden>
        <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
      </div>

      <div className="flex h-16 items-center justify-between gap-3 px-3 md:h-20 md:gap-6 md:px-6">
        {/* Faixa atual */}
        <div className="flex min-w-0 flex-1 items-center gap-3 md:w-64 md:flex-none">
          <Cover
            src={trackCover(track)}
            title={track.title}
            className="h-11 w-11 shrink-0 md:h-12 md:w-12"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{track.title}</p>
            <Link
              to={`/artists/${track.artist.id}`}
              className="block truncate text-xs text-muted hover:text-fg hover:underline"
            >
              {track.artist.name}
            </Link>
          </div>
          <button
            onClick={() => toggleFavorite.mutate(track)}
            aria-label={isFavorite ? 'Remover das curtidas' : 'Curtir'}
            aria-pressed={isFavorite}
            className={clsx(
              'ml-1 hidden shrink-0 sm:block',
              isFavorite ? 'text-accent' : 'text-muted hover:text-fg',
            )}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Controles + progresso */}
        <div className="flex flex-col items-center gap-1 md:flex-1">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={toggleShuffle}
              aria-label="Aleatório"
              aria-pressed={isShuffle}
              className={clsx(
                'hidden md:block',
                isShuffle ? 'text-accent' : 'text-muted hover:text-fg',
              )}
            >
              <Shuffle size={18} />
            </button>
            <button onClick={previous} className="hover:text-accent" aria-label="Anterior">
              <SkipBack size={20} />
            </button>
            <button
              onClick={togglePlay}
              className="grid h-9 w-9 place-items-center rounded-full bg-accent text-black hover:bg-accent-hover"
              aria-label={isPlaying ? 'Pausar' : 'Tocar'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={next} className="hover:text-accent" aria-label="Próxima">
              <SkipForward size={20} />
            </button>
            <button
              onClick={cycleRepeatMode}
              aria-label={`Repetir: ${repeatMode === 'off' ? 'desligado' : repeatMode === 'all' ? 'tudo' : 'uma música'}`}
              className={clsx(
                'hidden md:block',
                repeatMode !== 'off' ? 'text-accent' : 'text-muted hover:text-fg',
              )}
            >
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          <div className="hidden w-full max-w-md items-center gap-2 text-xs tabular-nums text-muted md:flex">
            <span className="w-10 text-right">{formatTime(progressSec)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.5}
              value={Math.min(progressSec, duration)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Progresso da música"
              className="flex-1"
              style={{
                background: `linear-gradient(to right, rgb(var(--c-accent)) ${percent}%, rgb(var(--c-fg) / 0.2) ${percent}%)`,
              }}
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume (só desktop) */}
        <div className="hidden w-44 items-center justify-end gap-2 md:flex">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
            className="text-muted hover:text-fg"
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="w-24"
          />
        </div>
      </div>
    </footer>
  );
}
