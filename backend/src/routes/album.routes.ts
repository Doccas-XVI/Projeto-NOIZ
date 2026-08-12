import { Router } from 'express';
import { albumController } from '@/controllers/album.controller';
import { authMiddleware, requireRole } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { uploadImage } from '@/middlewares/upload.middleware';
import { createAlbumSchema } from '@/dtos/catalog.dto';

export const albumRoutes = Router();

albumRoutes.get('/recent', albumController.recent);
albumRoutes.get('/:id', albumController.getById);

albumRoutes.post(
  '/',
  authMiddleware,
  requireRole('ARTIST', 'ADMIN'),
  uploadImage.single('cover'),
  validateBody(createAlbumSchema),
  albumController.create,
);
