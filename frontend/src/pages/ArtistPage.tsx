import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';
import { catalogService } from '@/services/catalogService';
import { MediaCard } from '@/components/cards/MediaCard';

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => catalogService.getArtist(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 py-8">
        <div className="skeleton h-40 w-40 rounded-full" />
        <div className="skeleton h-6 w-64" />
      </div>
    );
  }

  if (!artist) return null;

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center gap-6">
        <div className="h-40 w-40 shrink-0 overflow-hidden rounded-full bg-surface">
          {artist.avatarUrl ? (
            <img src={artist.avatarUrl} alt={artist.name} className="h-full w-full object-cover" />
          ) : (
            <div className="skeleton h-full w-full rounded-full" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-black">{artist.name}</h1>
            {artist.verified && <BadgeCheck className="text-accent" size={24} />}
          </div>
          {artist.bio && <p className="mt-2 max-w-lg text-sm text-muted">{artist.bio}</p>}
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold">Álbuns</h2>
        <div className="flex flex-wrap gap-4">
          {artist.albums.length === 0 && (
            <p className="text-sm text-muted">Este artista ainda não lançou álbuns.</p>
          )}
          {artist.albums.map((album) => (
            <MediaCard
              key={album.id}
              title={album.title}
              subtitle={album.type}
              coverUrl={album.coverUrl}
              onClick={() => navigate(`/albums/${album.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
