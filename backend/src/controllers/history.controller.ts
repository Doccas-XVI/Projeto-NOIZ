import { Request, Response } from 'express';
import { historyService } from '@/services/history.service';
import { asyncHandler } from '@/utils/asyncHandler';

export const historyController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    await historyService.register(req.user!.id, req.body.trackId);
    res.status(201).json({ success: true });
  }),

  recent: asyncHandler(async (req: Request, res: Response) => {
    const history = await historyService.recent(req.user!.id);
    res.json({ success: true, data: history });
  }),
};
