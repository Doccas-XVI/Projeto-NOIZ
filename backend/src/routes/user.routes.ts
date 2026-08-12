import { Router } from 'express';
import { userController } from '@/controllers/user.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { uploadImage } from '@/middlewares/upload.middleware';
import { updateProfileSchema } from '@/dtos/user.dto';

export const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.get('/me', userController.me);
userRoutes.patch('/me', validateBody(updateProfileSchema), userController.updateProfile);
userRoutes.post('/me/avatar', uploadImage.single('image'), userController.uploadAvatar);
