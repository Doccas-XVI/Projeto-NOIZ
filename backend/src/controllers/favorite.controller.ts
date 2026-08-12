import { Request, Response } from 'express';
import { favoriteService } from '@/services/favorite.service';
import { asyncHandler } from '@/utils/asyncHandler';

export const favoriteController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const favorites = await favoriteService.list(req.user!.id);
    res.json({ success: true, data: favorites });
  }),

  toggle: asyncHandler(async (req: Request, res: Response) => {
    const result = await favoriteService.toggle(req.user!.id, req.params.trackId);
    res.json({ success: true, data: result });
  }),
};
