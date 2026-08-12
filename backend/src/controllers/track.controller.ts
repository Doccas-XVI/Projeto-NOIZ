import { Request, Response } from 'express';
import { trackService } from '@/services/track.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { AppError } from '@/utils/AppError';

// Multer com .fields() popula req.files como um objeto { campo: File[] }
type MulterFiles = Record<string, Express.Multer.File[]>;

export const trackController = {
  upload: asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as MulterFiles;
    const audioFile = files?.audio?.[0];
    const coverFile = files?.cover?.[0];

    if (!audioFile) throw AppError.badRequest('Envie o arquivo de áudio no campo "audio"');

    const track = await trackService.upload(req.user!.id, req.body, audioFile, coverFile);
    res.status(201).json({ success: true, data: track });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const track = await trackService.getById(req.params.id);
    res.json({ success: true, data: track });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const track = await trackService.update(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: track });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await trackService.delete(req.user!.id, req.params.id);
    res.status(204).send();
  }),

  registerPlay: asyncHandler(async (req: Request, res: Response) => {
    await trackService.registerPlay(req.params.id);
    res.status(204).send();
  }),

  search: asyncHandler(async (req: Request, res: Response) => {
    const results = await trackService.search(String(req.query.q ?? ''));
    res.json({ success: true, data: results });
  }),
};
