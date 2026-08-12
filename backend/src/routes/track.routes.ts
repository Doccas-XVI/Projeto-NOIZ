import { Router } from 'express';
import { trackController } from '@/controllers/track.controller';
import { authMiddleware, requireRole } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { uploadTrackFiles } from '@/middlewares/upload.middleware';
import { createTrackSchema, updateTrackSchema } from '@/dtos/catalog.dto';

export const trackRoutes = Router();

trackRoutes.get('/search', trackController.search);
trackRoutes.get('/:id', trackController.getById);
trackRoutes.post('/:id/play', trackController.registerPlay); // sem auth: histórico anônimo é registrado à parte

trackRoutes.post(
  '/',
  authMiddleware,
  requireRole('ARTIST', 'ADMIN'),
  uploadTrackFiles,
  validateBody(createTrackSchema),
  trackController.upload,
);

trackRoutes.patch(
  '/:id',
  authMiddleware,
  requireRole('ARTIST', 'ADMIN'),
  validateBody(updateTrackSchema),
  trackController.update,
);

trackRoutes.delete('/:id', authMiddleware, requireRole('ARTIST', 'ADMIN'), trackController.delete);
