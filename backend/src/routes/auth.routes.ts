import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { validateBody } from '@/middlewares/validate.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/dtos/auth.dto';

export const authRoutes = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Cria uma nova conta de usuário
 */
authRoutes.post('/register', validateBody(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autentica um usuário e retorna access/refresh tokens
 */
authRoutes.post('/login', validateBody(loginSchema), authController.login);

authRoutes.post('/refresh', validateBody(refreshTokenSchema), authController.refresh);
authRoutes.post('/logout', validateBody(refreshTokenSchema), authController.logout);
authRoutes.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
authRoutes.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);
