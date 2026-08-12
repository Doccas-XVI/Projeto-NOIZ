import { Router } from 'express';
import { z } from 'zod';
import { historyController } from '@/controllers/history.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';

export const historyRoutes = Router();

historyRoutes.use(authMiddleware);
historyRoutes.get('/', historyController.recent);
historyRoutes.post('/', validateBody(z.object({ trackId: z.string().uuid() })), historyController.register);
