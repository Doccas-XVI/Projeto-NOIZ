import { Router } from 'express';
import { artistController } from '@/controllers/artist.controller';
import { authMiddleware, requireRole } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { uploadImage } from '@/middlewares/upload.middleware';
import { createArtistSchema } from '@/dtos/catalog.dto';

export const artistRoutes = Router();

artistRoutes.get('/search', artistController.search);
artistRoutes.get('/:id', artistController.getById);

artistRoutes.post('/', authMiddleware, validateBody(createArtistSchema), artistController.createProfile);

artistRoutes.post(
  '/me/avatar',
  authMiddleware,
  requireRole('ARTIST', 'ADMIN'),
  uploadImage.single('image'),
  artistController.uploadAvatar,
);

artistRoutes.post(
  '/me/cover',
  authMiddleware,
  requireRole('ARTIST', 'ADMIN'),
  uploadImage.single('image'),
  artistController.uploadCover,
);
