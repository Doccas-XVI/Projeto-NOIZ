import { create } from 'zustand';
import type { Track } from '@/types/domain';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  /** Muda a cada seleção de faixa (mesmo repetindo a mesma): força o áudio a recarregar. */
  playId: number;
  isPlaying: boolean;
  progressSec: number;
  durationSec: number;
  volume: number; // 0 a 1
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  /** Pedido de "pular para X segundos" — consumido pelo AudioEngine. */
  seekRequest: number | null;

  playQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  togglePlay: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (sec: number) => void;
  clearSeek: () => void;
  setProgress: (sec: number) => void;
  setDuration: (sec: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  reset: () => void;
}

const initial = {
  queue: [] as Track[],
  currentIndex: -1,
  playId: 0,
  isPlaying: false,
  progressSec: 0,
  durationSec: 0,
  seekRequest: null as number | null,
};

/** Seleciona a faixa atual. Use com `usePlayerStore(selectCurrentTrack)`. */
export const selectCurrentTrack = (s: PlayerState): Track | null => s.queue[s.currentIndex] ?? null;

/**
 * Estado do player isolado do de auth: são domínios diferentes e mudam em
 * frequências diferentes (o progresso muda 4x por segundo, a sessão quase nunca).
 * Quem toca o áudio de verdade é o <AudioEngine />, que lê/escreve neste store.
 */
export const usePlayerStore = create<PlayerState>()((set, get) => ({
  ...initial,
  volume: 0.8,
  isMuted: false,
  isShuffle: false,
  repeatMode: 'off',

  playQueue: (tracks, startIndex = 0) => {
    if (tracks.length === 0) return;
    set((s) => ({
      queue: tracks,
      currentIndex: Math.min(Math.max(startIndex, 0), tracks.length - 1),
      playId: s.playId + 1,
      isPlaying: true,
      progressSec: 0,
      durationSec: 0,
    }));
  },

  addToQueue: (track) => {
    const { queue } = get();
    if (queue.length === 0) {
      get().playQueue([track]);
      return;
    }
    set({ queue: [...queue, track] });
  },

  togglePlay: () => {
    if (get().currentIndex === -1) return;
    set((s) => ({ isPlaying: !s.isPlaying }));
  },

  pause: () => set({ isPlaying: false }),

  next: () => {
    const { queue, currentIndex, isShuffle, repeatMode, playId } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (isShuffle && queue.length > 1) {
      // sorteia uma faixa diferente da atual
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // fim da fila: para e volta ao início da última faixa
        set({ isPlaying: false, progressSec: 0, seekRequest: 0 });
        return;
      }
    }

    set({
      currentIndex: nextIndex,
      playId: playId + 1,
      isPlaying: true,
      progressSec: 0,
      durationSec: 0,
    });
  },

  previous: () => {
    const { currentIndex, progressSec, playId } = get();
    if (currentIndex === -1) return;
    // Comportamento padrão dos players: após 3s, "anterior" reinicia a faixa atual
    if (progressSec > 3 || currentIndex === 0) {
      set({ progressSec: 0, seekRequest: 0 });
      return;
    }
    set({
      currentIndex: currentIndex - 1,
      playId: playId + 1,
      isPlaying: true,
      progressSec: 0,
      durationSec: 0,
    });
  },

  seek: (sec) => set({ progressSec: sec, seekRequest: sec }),
  clearSeek: () => set({ seekRequest: null }),
  setProgress: (sec) => set({ progressSec: sec }),
  setDuration: (sec) => set({ durationSec: sec }),
  setVolume: (v) => set({ volume: Math.min(1, Math.max(0, v)), isMuted: false }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
  cycleRepeatMode: () =>
    set((s) => ({
      repeatMode: s.repeatMode === 'off' ? 'all' : s.repeatMode === 'all' ? 'one' : 'off',
    })),

  reset: () => set({ ...initial }),
}));
