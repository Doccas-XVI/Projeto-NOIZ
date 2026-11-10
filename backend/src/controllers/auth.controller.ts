import { Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import { asyncHandler } from '@/utils/asyncHandler';

/**
 * Controllers ficam "burros" de propósito: extraem dados da requisição,
 * chamam o service e formatam a resposta. Nenhuma regra de negócio mora
 * aqui — isso facilita testar o service isoladamente (sem mockar req/res).
 */
export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refresh(req.body.refreshToken);
    res.status(200).json({ success: true, data: result });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    res.status(204).send();
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body);
    res.status(200).json({
      success: true,
      message: 'Se o e-mail existir em nossa base, um link de recuperação foi enviado',
    });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);
    res.status(200).json({ success: true, message: 'Senha redefinida com sucesso' });
  }),
};
