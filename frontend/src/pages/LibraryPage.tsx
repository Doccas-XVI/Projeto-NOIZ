import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { catalogService } from '@/services/catalogService';
import { MediaCard, MediaCardSkeleton } from '@/components/cards/MediaCard';

export default function LibraryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['playlists', 'mine'],
    queryFn: catalogService.myPlaylists,
  });

  const createMutation = useMutation({
    mutationFn: () => catalogService.createPlaylist('Nova playlist'),
    onSuccess: (playlist) => {
      queryClient.invalidateQueries({ queryKey: ['playlists', 'mine'] });
      toast.success('Playlist criada!');
      navigate(`/playlists/${playlist.id}`);
    },
  });

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sua biblioteca</h1>
        <button
          onClick={() => createMutation.mutate()}
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-black hover:bg-accent-hover"
        >
          <Plus size={16} /> Nova playlist
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <MediaCardSkeleton key={i} />)}

        {playlists?.map((playlist) => (
          <MediaCard
            key={playlist.id}
            title={playlist.name}
            subtitle={`${playlist.tracks?.length ?? 0} músicas`}
            coverUrl={playlist.coverUrl}
            onClick={() => navigate(`/playlists/${playlist.id}`)}
          />
        ))}

        {playlists?.length === 0 && (
          <p className="text-sm text-muted">
            Você ainda não tem playlists. Crie a primeira agora!
          </p>
        )}
      </div>
    </div>
  );
}
