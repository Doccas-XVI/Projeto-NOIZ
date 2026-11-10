import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { libraryService } from '@/services/libraryService';
import { getErrorMessage } from '@/utils/errors';

export const PLAYLISTS_KEY = ['playlists', 'mine'] as const;

export function useMyPlaylists() {
  return useQuery({ queryKey: PLAYLISTS_KEY, queryFn: libraryService.myPlaylists });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => libraryService.createPlaylist(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLAYLISTS_KEY }),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAddToPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
      libraryService.addTrack(playlistId, trackId),
    onSuccess: (_data, { playlistId }) => {
      toast.success('Adicionada à playlist');
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
