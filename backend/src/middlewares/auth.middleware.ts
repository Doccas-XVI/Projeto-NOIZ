import { NextFunction, Request, Response } from 'express';
import { AppError } from '@/utils/AppError';
import { verifyAccessToken } from '@/utils/jwt';

// Extende o tipo Request do Express para carregar o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

/**
 * Protege rotas exigindo "Authorization: Bearer <token>".
 * Qualquer falha aqui vira 401 — nunca deixamos passar sem validar.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Token de acesso ausente');
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw AppError.unauthorized('Token de acesso inválido ou expirado');
  }
}

/**
 * Restringe uma rota a determinadas roles (ex: só ARTIST pode fazer upload
 * de música, só ADMIN pode verificar um artista).
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw AppError.forbidden('Você não tem permissão para esta ação');
    }
    next();
  };
}
