import { Request, Response } from 'express';
import { albumService } from '@/services/album.service';
import { asyncHandler } from '@/utils/asyncHandler';

export const albumController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const album = await albumService.create(req.user!.id, req.body, req.file);
    res.status(201).json({ success: true, data: album });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const album = await albumService.getById(req.params.id);
    res.json({ success: true, data: album });
  }),

  recent: asyncHandler(async (_req: Request, res: Response) => {
    const albums = await albumService.recent();
    res.json({ success: true, data: albums });
  }),
};
