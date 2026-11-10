import type { Track } from '@/types/domain';

/** 187 -> "3:07" */
export function formatTime(totalSec: number): string {
  if (!Number.isFinite(totalSec) || totalSec < 0) return '0:00';
  const minutes = Math.floor(totalSec / 60);
  const seconds = Math.floor(totalSec % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** Capa da música; se ela não tiver, usa a capa do álbum. */
export function trackCover(track: Track): string | null | undefined {
  return track.coverUrl ?? track.album?.coverUrl;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
