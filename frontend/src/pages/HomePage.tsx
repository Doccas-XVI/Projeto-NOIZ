import { MediaCardSkeleton } from '@/components/cards/MediaCard';

/**
 * Nesta etapa a home só demonstra o layout e o padrão de skeleton
 * loading. Próxima etapa incremental: substituir os skeletons por
 * `useQuery(['albums', 'recent'], () => albumService.recent())`
 * consumindo o endpoint /albums e /playlists reais.
 */
export default function HomePage() {
  return (
    <div className="space-y-8 py-4">
      <section>
        <h2 className="mb-4 text-xl font-bold">Bom te ver de volta 🎧</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Feito pra você</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
