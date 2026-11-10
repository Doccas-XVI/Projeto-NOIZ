import { Router } from 'express';
import { favoriteController } from '@/controllers/favorite.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

export const favoriteRoutes = Router();

favoriteRoutes.use(authMiddleware);
favoriteRoutes.get('/', favoriteController.list);
favoriteRoutes.post('/:trackId/toggle', favoriteController.toggle);
