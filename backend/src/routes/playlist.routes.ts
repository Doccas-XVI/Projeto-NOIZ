import { Router } from 'express';
import { playlistController } from '@/controllers/playlist.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { uploadImage } from '@/middlewares/upload.middleware';
import { addTrackToPlaylistSchema, createPlaylistSchema, updatePlaylistSchema } from '@/dtos/playlist.dto';

export const playlistRoutes = Router();

// Todas as rotas de playlist exigem usuário autenticado
playlistRoutes.use(authMiddleware);

playlistRoutes.get('/', playlistController.mine);
playlistRoutes.post('/', validateBody(createPlaylistSchema), playlistController.create);
playlistRoutes.get('/:id', playlistController.getById);
playlistRoutes.patch('/:id', validateBody(updatePlaylistSchema), playlistController.update);
playlistRoutes.delete('/:id', playlistController.delete);

playlistRoutes.post('/:id/cover', uploadImage.single('cover'), playlistController.uploadCover);
playlistRoutes.post('/:id/tracks', validateBody(addTrackToPlaylistSchema), playlistController.addTrack);
playlistRoutes.delete('/:id/tracks/:trackId', playlistController.removeTrack);
