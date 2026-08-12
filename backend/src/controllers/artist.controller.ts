import { Request, Response } from 'express';
import { artistService } from '@/services/artist.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { AppError } from '@/utils/AppError';

export const artistController = {
  createProfile: asyncHandler(async (req: Request, res: Response) => {
    const artist = await artistService.createProfile(req.user!.id, req.body);
    res.status(201).json({ success: true, data: artist });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const artist = await artistService.getById(req.params.id);
    res.json({ success: true, data: artist });
  }),

  uploadAvatar: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest('Envie um arquivo de imagem');
    const artist = await artistService.uploadAvatar(req.user!.id, req.file);
    res.json({ success: true, data: artist });
  }),

  uploadCover: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest('Envie um arquivo de imagem');
    const artist = await artistService.uploadCover(req.user!.id, req.file);
    res.json({ success: true, data: artist });
  }),

  search: asyncHandler(async (req: Request, res: Response) => {
    const results = await artistService.search(String(req.query.q ?? ''));
    res.json({ success: true, data: results });
  }),
};
