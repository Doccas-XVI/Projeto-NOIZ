import { create } from 'zustand';
import type { Track } from '@/types/domain';

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  progressSec: number;
  volume: number; // 0 a 1
  isShuffle: boolean;
  repeatMode: RepeatMode;

  currentTrack: () => Track | null;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  setProgress: (sec: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
}

/**
 * Estado do player fica isolado do estado de auth: são domínios
 * completamente diferentes e mudam em frequências diferentes
 * (progresso muda a cada segundo; sessão muda raramente).
 * Separar evita que o player inteiro re-renderize por causa de auth.
 */
export const usePlayerStore = create<PlayerState>()((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  progressSec: 0,
  volume: 0.8,
  isShuffle: false,
  repeatMode: 'off',

  currentTrack: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },

  playQueue: (tracks, startIndex = 0) =>
    set({ queue: tracks, currentIndex: startIndex, isPlaying: true, progressSec: 0 }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { queue, currentIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      set({ progressSec: 0, isPlaying: true });
      return;
    }

    let nextIndex = isShuffle
      ? Math.floor(Math.random() * queue.length)
      : currentIndex + 1;

    if (nextIndex >= queue.length) {
      nextIndex = repeatMode === 'all' ? 0 : currentIndex;
      if (repeatMode !== 'all') {
        set({ isPlaying: false });
        return;
      }
    }

    set({ currentIndex: nextIndex, progressSec: 0, isPlaying: true });
  },

  previous: () => {
    const { currentIndex } = get();
    const prevIndex = Math.max(0, currentIndex - 1);
    set({ currentIndex: prevIndex, progressSec: 0 });
  },

  setProgress: (sec) => set({ progressSec: sec }),
  setVolume: (v) => set({ volume: Math.min(1, Math.max(0, v)) }),
  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
  cycleRepeatMode: () =>
    set((s) => ({
      repeatMode: s.repeatMode === 'off' ? 'all' : s.repeatMode === 'all' ? 'one' : 'off',
    })),
}));
