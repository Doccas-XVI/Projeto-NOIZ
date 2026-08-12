import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import clsx from 'clsx';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    next,
    previous,
    progressSec,
    setProgress,
    volume,
    setVolume,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
  } = usePlayerStore();

  const track = currentTrack();
  const duration = track?.durationSec ?? 0;

  // Sem música na fila: mostra barra "vazia" em vez de esconder — mantém
  // o layout estável e sinaliza visualmente que o player está pronto.
  if (!track) {
    return (
      <footer className="flex h-20 items-center justify-center border-t border-white/5 bg-surface text-sm text-muted">
        Escolha uma música para começar a ouvir
      </footer>
    );
  }

  return (
    <footer className="flex h-20 items-center justify-between gap-6 border-t border-white/5 bg-surface px-6">
      <div className="flex w-56 min-w-0 items-center gap-3">
        <div className="skeleton h-12 w-12 shrink-0" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{track.title}</p>
          <p className="truncate text-xs text-muted">{track.artist.name}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={clsx('text-muted hover:text-white', isShuffle && 'text-accent')}
            aria-label="Aleatório"
          >
            <Shuffle size={18} />
          </button>
          <button onClick={previous} className="text-white hover:text-accent" aria-label="Anterior">
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="grid h-9 w-9 place-items-center rounded-full bg-accent text-black hover:bg-accent-hover"
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={next} className="text-white hover:text-accent" aria-label="Próxima">
            <SkipForward size={20} />
          </button>
          <button
            onClick={cycleRepeatMode}
            className={clsx('text-muted hover:text-white', repeatMode !== 'off' && 'text-accent')}
            aria-label="Repetir"
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        <div className="flex w-full max-w-md items-center gap-2 text-xs text-muted">
          <span>{formatTime(progressSec)}</span>
          <input
            type="range"
            min={0}
            max={duration}
            value={progressSec}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-accent"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex w-40 items-center justify-end gap-2">
        <Volume2 size={18} className="text-muted" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="h-1 w-24 cursor-pointer accent-accent"
        />
      </div>
    </footer>
  );
}
