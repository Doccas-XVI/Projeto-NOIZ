import { Request, Response } from 'express';
import { playlistService } from '@/services/playlist.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { AppError } from '@/utils/AppError';

export const playlistController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const playlist = await playlistService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data: playlist });
  }),

  mine: asyncHandler(async (req: Request, res: Response) => {
    const playlists = await playlistService.myPlaylists(req.user!.id);
    res.json({ success: true, data: playlists });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const playlist = await playlistService.getById(req.params.id);
    res.json({ success: true, data: playlist });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const playlist = await playlistService.update(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: playlist });
  }),

  uploadCover: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest('Envie uma imagem de capa');
    const playlist = await playlistService.uploadCover(req.user!.id, req.params.id, req.file);
    res.json({ success: true, data: playlist });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await playlistService.delete(req.user!.id, req.params.id);
    res.status(204).send();
  }),

  addTrack: asyncHandler(async (req: Request, res: Response) => {
    await playlistService.addTrack(req.user!.id, req.params.id, req.body.trackId);
    res.status(201).json({ success: true });
  }),

  removeTrack: asyncHandler(async (req: Request, res: Response) => {
    await playlistService.removeTrack(req.user!.id, req.params.id, req.params.trackId);
    res.status(204).send();
  }),
};
