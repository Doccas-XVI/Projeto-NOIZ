import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from 'lucide-react';
import { catalogService } from '@/services/catalogService';
import { MediaCard, MediaCardSkeleton } from '@/components/cards/MediaCard';
import { usePlayerStore } from '@/store/playerStore';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const playQueue = usePlayerStore((s) => s.playQueue);

  const { data, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => catalogService.search(query),
    enabled: query.trim().length > 1, // só busca com 2+ caracteres — evita request a cada tecla solta
  });

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center gap-3 rounded-full bg-surface px-4 py-3">
        <SearchIcon size={18} className="text-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque por música, artista ou álbum"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      {isFetching && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      )}

      {data && !isFetching && (
        <>
          {data.tracks.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold">Músicas</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {data.tracks.map((track) => (
                  <MediaCard
                    key={track.id}
                    title={track.title}
                    subtitle={track.artist.name}
                    coverUrl={track.coverUrl ?? track.album?.coverUrl}
                    onClick={() => playQueue(data.tracks, data.tracks.indexOf(track))}
                  />
                ))}
              </div>
            </section>
          )}

          {data.albums.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold">Álbuns</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {data.albums.map((album) => (
                  <MediaCard
                    key={album.id}
                    title={album.title}
                    subtitle={album.artist.name}
                    coverUrl={album.coverUrl}
                    onClick={() => navigate(`/albums/${album.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {data.artists.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold">Artistas</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {data.artists.map((artist) => (
                  <MediaCard
                    key={artist.id}
                    title={artist.name}
                    subtitle="Artista"
                    coverUrl={artist.avatarUrl}
                    onClick={() => navigate(`/artists/${artist.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {!data.tracks.length && !data.albums.length && !data.artists.length && (
            <p className="text-sm text-muted">Nenhum resultado para "{query}"</p>
          )}
        </>
      )}
    </div>
  );
}
