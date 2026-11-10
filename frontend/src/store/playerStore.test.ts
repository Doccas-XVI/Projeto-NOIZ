import { beforeEach, describe, expect, it } from 'vitest';
import { usePlayerStore, selectCurrentTrack } from './playerStore';
import type { Track } from '@/types/domain';

const artist = { id: 'a1', name: 'MC Corre', verified: false };
const makeTrack = (id: string): Track => ({
  id,
  title: `Faixa ${id}`,
  durationSec: 180,
  fileUrl: `https://cdn/${id}.mp3`,
  artist,
});
const queue = ['1', '2', '3'].map(makeTrack);

const state = () => usePlayerStore.getState();
const currentId = () => selectCurrentTrack(state())?.id;

beforeEach(() => {
  state().reset();
  usePlayerStore.setState({ isShuffle: false, repeatMode: 'off', isMuted: false, volume: 0.8 });
});

describe('playQueue', () => {
  it('começa a tocar na faixa pedida', () => {
    state().playQueue(queue, 1);
    expect(currentId()).toBe('2');
    expect(state().isPlaying).toBe(true);
  });

  it('ignora fila vazia e índice fora do limite', () => {
    state().playQueue([]);
    expect(state().currentIndex).toBe(-1);
    state().playQueue(queue, 99);
    expect(currentId()).toBe('3');
  });

  it('muda o playId mesmo ao tocar a mesma faixa de novo (força recarregar o áudio)', () => {
    state().playQueue(queue, 0);
    const first = state().playId;
    state().playQueue(queue, 0);
    expect(state().playId).toBe(first + 1);
  });
});

describe('next', () => {
  it('avança na ordem', () => {
    state().playQueue(queue, 0);
    state().next();
    expect(currentId()).toBe('2');
  });

  it('no fim da fila (repeat off) para de tocar e mantém a última faixa', () => {
    state().playQueue(queue, 2);
    state().next();
    expect(currentId()).toBe('3');
    expect(state().isPlaying).toBe(false);
  });

  it('no fim da fila (repeat all) volta para a primeira', () => {
    usePlayerStore.setState({ repeatMode: 'all' });
    state().playQueue(queue, 2);
    state().next();
    expect(currentId()).toBe('1');
    expect(state().isPlaying).toBe(true);
  });

  it('shuffle nunca sorteia a faixa que já está tocando', () => {
    usePlayerStore.setState({ isShuffle: true });
    state().playQueue(queue, 0);
    for (let i = 0; i < 200; i++) {
      const before = currentId();
      state().next();
      expect(currentId()).not.toBe(before);
    }
  });

  it('shuffle com uma faixa só não trava em loop infinito', () => {
    usePlayerStore.setState({ isShuffle: true, repeatMode: 'all' });
    state().playQueue([makeTrack('solo')], 0);
    state().next();
    expect(currentId()).toBe('solo');
  });
});

describe('previous', () => {
  it('depois de 3s, reinicia a faixa atual em vez de voltar', () => {
    state().playQueue(queue, 1);
    state().setProgress(10);
    state().previous();
    expect(currentId()).toBe('2');
    expect(state().seekRequest).toBe(0);
  });

  it('no começo da faixa, volta para a anterior', () => {
    state().playQueue(queue, 1);
    state().setProgress(1);
    state().previous();
    expect(currentId()).toBe('1');
  });

  it('na primeira faixa só reinicia', () => {
    state().playQueue(queue, 0);
    state().setProgress(1);
    state().previous();
    expect(currentId()).toBe('1');
    expect(state().seekRequest).toBe(0);
  });
});

describe('controles', () => {
  it('togglePlay não faz nada sem fila', () => {
    state().togglePlay();
    expect(state().isPlaying).toBe(false);
  });

  it('seek guarda o pedido para o AudioEngine consumir e clearSeek limpa', () => {
    state().playQueue(queue, 0);
    state().seek(42);
    expect(state().seekRequest).toBe(42);
    expect(state().progressSec).toBe(42);
    state().clearSeek();
    expect(state().seekRequest).toBeNull();
  });

  it('volume fica entre 0 e 1 e sair do mudo ao mexer', () => {
    state().toggleMute();
    state().setVolume(5);
    expect(state().volume).toBe(1);
    expect(state().isMuted).toBe(false);
    state().setVolume(-3);
    expect(state().volume).toBe(0);
  });

  it('repeat alterna off -> all -> one -> off', () => {
    const modes = [];
    for (let i = 0; i < 3; i++) {
      state().cycleRepeatMode();
      modes.push(state().repeatMode);
    }
    expect(modes).toEqual(['all', 'one', 'off']);
  });

  it('addToQueue com fila vazia já começa a tocar; com fila, só enfileira', () => {
    state().addToQueue(makeTrack('x'));
    expect(currentId()).toBe('x');
    expect(state().isPlaying).toBe(true);

    state().addToQueue(makeTrack('y'));
    expect(state().queue.map((t) => t.id)).toEqual(['x', 'y']);
    expect(currentId()).toBe('x');
  });

  it('reset (logout) zera fila e para o player', () => {
    state().playQueue(queue, 1);
    state().reset();
    expect(state().queue).toEqual([]);
    expect(state().isPlaying).toBe(false);
    expect(currentId()).toBeUndefined();
  });
});
