import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { libraryService } from '@/services/libraryService';
import { getErrorMessage } from '@/utils/errors';
import type { Track } from '@/types/domain';

export const FAVORITES_KEY = ['favorites'] as const;

/** Lista de músicas curtidas (cache compartilhado por todo o app). */
export function useFavoritesQuery() {
  return useQuery({ queryKey: FAVORITES_KEY, queryFn: libraryService.favorites });
}

/** Conjunto de ids curtidos — para saber, em O(1), se o coração fica preenchido. */
export function useFavoriteIds() {
  const { data } = useFavoritesQuery();
  return useMemo(() => new Set((data ?? []).map((track) => track.id)), [data]);
}

/**
 * Curtir/descurtir com atualização OTIMISTA: o coração muda na hora, sem
 * esperar a resposta do servidor; se der erro, volta ao estado anterior.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (track: Track) => libraryService.toggleFavorite(track.id),

    onMutate: async (track) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });
      const previous = queryClient.getQueryData<Track[]>(FAVORITES_KEY) ?? [];
      const alreadyFavorite = previous.some((t) => t.id === track.id);

      queryClient.setQueryData<Track[]>(
        FAVORITES_KEY,
        alreadyFavorite
          ? previous.filter((t) => t.id !== track.id)
          : [{ ...track, isFavorite: true }, ...previous],
      );
      return { previous };
    },

    onError: (error, _track, context) => {
      queryClient.setQueryData(FAVORITES_KEY, context?.previous);
      toast.error(getErrorMessage(error));
    },

    onSuccess: (result) => {
      toast.success(result.favorited ? 'Adicionada às curtidas' : 'Removida das curtidas');
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: FAVORITES_KEY }),
  });
}
