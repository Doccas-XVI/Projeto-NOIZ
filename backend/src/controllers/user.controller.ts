import { Request, Response } from 'express';
import { userService } from '@/services/user.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { AppError } from '@/utils/AppError';

export const userController = {
  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getProfile(req.user!.id);
    res.json({ success: true, data: user });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, data: user });
  }),

  uploadAvatar: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest('Envie um arquivo de imagem');
    const user = await userService.uploadAvatar(req.user!.id, req.file);
    res.json({ success: true, data: user });
  }),
};
