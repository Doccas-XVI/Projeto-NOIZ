import { Request, Response } from 'express';
import { trackService } from '@/services/track.service';
import { albumService } from '@/services/album.service';
import { artistService } from '@/services/artist.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { AppError } from '@/utils/AppError';

/**
 * Busca unificada: um único request devolve os 3 tipos de resultado
 * em paralelo (Promise.all), em vez do frontend disparar 3 chamadas
 * separadas para montar a mesma tela de busca.
 */
export const searchController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const query = String(req.query.q ?? '').trim();
    if (!query) throw AppError.badRequest('Informe o parâmetro de busca "q"');

    const [tracks, albums, artists] = await Promise.all([
      trackService.search(query),
      albumService.search(query),
      artistService.search(query),
    ]);

    res.json({ success: true, data: { tracks, albums, artists } });
  }),
};
