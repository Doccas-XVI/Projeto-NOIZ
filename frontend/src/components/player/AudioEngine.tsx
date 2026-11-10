import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usePlayerStore, selectCurrentTrack } from '@/store/playerStore';
import { libraryService } from '@/services/libraryService';
import { trackCover } from '@/utils/format';

/** Depois de quantos segundos de reprodução a faixa conta como "ouvida" (histórico + plays). */
const COUNT_AS_PLAYED_AFTER_SEC = 15;

/**
 * Quem toca o som DE VERDADE: um único <audio> escondido, montado uma vez no
 * layout. Ele sincroniza com o store (fonte da verdade da UI):
 *   store -> <audio>: faixa atual, play/pause, volume, pedidos de seek
 *   <audio> -> store: progresso, duração, fim da faixa
 * A PlayerBar só desenha botões e chama ações do store — não toca nada.
 */
export function AudioEngine() {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement>(null);
  const countedPlayIdRef = useRef<number | null>(null);

  const track = usePlayerStore(selectCurrentTrack);
  const src = track?.fileUrl ?? null;
  const playId = usePlayerStore((s) => s.playId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const seekRequest = usePlayerStore((s) => s.seekRequest);

  // 1) Troca de faixa: carrega o novo arquivo (playId muda até ao repetir a mesma faixa)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!src) {
      audio.removeAttribute('src');
      audio.load();
      return;
    }
    audio.src = src;
    audio.load();
    countedPlayIdRef.current = null;
  }, [src, playId]);

  // 2) Play / Pause (também dispara depois que uma faixa nova é carregada)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (isPlaying) {
      audio.play().catch((error: DOMException) => {
        // AbortError acontece ao trocar de faixa rápido — não é erro de verdade
        if (error.name === 'AbortError') return;
        usePlayerStore.getState().pause();
        toast.error('Não foi possível tocar esta música.');
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, src, playId]);

  // 3) Volume / mudo
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // 4) Pedido de seek (barra de progresso, "anterior" reiniciando a faixa...)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || seekRequest === null) return;
    audio.currentTime = seekRequest;
    usePlayerStore.getState().clearSeek();
  }, [seekRequest]);

  // 5) Controles do sistema (teclas de mídia, tela de bloqueio do celular)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }
    const cover = trackCover(track);
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist.name,
      album: track.album?.title ?? '',
      artwork: cover ? [{ src: cover }] : [],
    });
    const { togglePlay, next, previous } = usePlayerStore.getState();
    navigator.mediaSession.setActionHandler('play', togglePlay);
    navigator.mediaSession.setActionHandler('pause', togglePlay);
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', previous);
  }, [track]);

  // 6) Atalho: barra de espaço = play/pause (se o foco não estiver num campo de texto)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== 'Space') return;
      const target = event.target as HTMLElement;
      if (
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName) ||
        target.isContentEditable
      )
        return;
      event.preventDefault();
      usePlayerStore.getState().togglePlay();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ---- Eventos do <audio> -> store ----
  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !track) return;
    const store = usePlayerStore.getState();
    store.setProgress(audio.currentTime);

    // Conta como "ouvida" uma única vez por reprodução, após alguns segundos
    const threshold = Math.min(COUNT_AS_PLAYED_AFTER_SEC, (audio.duration || Infinity) / 2);
    if (countedPlayIdRef.current !== playId && audio.currentTime >= threshold) {
      countedPlayIdRef.current = playId;
      libraryService
        .registerPlay(track.id)
        .then(() => queryClient.invalidateQueries({ queryKey: ['history'] }))
        .catch(() => undefined); // histórico é secundário: não incomoda o usuário se falhar
    }
  }

  function handleEnded() {
    const audio = audioRef.current;
    const { repeatMode, next } = usePlayerStore.getState();
    if (repeatMode === 'one' && audio) {
      audio.currentTime = 0;
      audio.play().catch(() => undefined);
      countedPlayIdRef.current = null; // cada repetição conta como uma nova reprodução
      return;
    }
    next();
  }

  function handleError() {
    if (!src) return;
    usePlayerStore.getState().pause();
    toast.error('O arquivo desta música não pôde ser carregado.');
  }

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={() => {
        const duration = audioRef.current?.duration;
        if (duration && Number.isFinite(duration)) usePlayerStore.getState().setDuration(duration);
      }}
      onEnded={handleEnded}
      onError={handleError}
    />
  );
}
