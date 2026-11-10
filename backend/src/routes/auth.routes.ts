import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { validateBody } from '@/middlewares/validate.middleware';
import { authLimiter } from '@/middlewares/rateLimit.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/dtos/auth.dto';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, validateBody(registerSchema), authController.register);

authRoutes.post('/login', authLimiter, validateBody(loginSchema), authController.login);

authRoutes.post('/refresh', validateBody(refreshTokenSchema), authController.refresh);
authRoutes.post('/logout', validateBody(refreshTokenSchema), authController.logout);
authRoutes.post(
  '/forgot-password',
  authLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);
authRoutes.post(
  '/reset-password',
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);
