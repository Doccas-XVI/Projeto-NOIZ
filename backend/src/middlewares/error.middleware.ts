import { NextFunction, Request, Response } from 'express';
import { AppError } from '@/utils/AppError';
import { env } from '@/config/env';

/**
 * Único ponto da aplicação que decide o formato da resposta de erro.
 * - AppError (erro de negócio previsto) -> statusCode e mensagem originais.
 * - Qualquer outro erro (bug, exceção do driver do banco etc) -> 500
 *   genérico, e só expomos o stack trace em desenvolvimento.
 *
 * Precisa ser o ÚLTIMO middleware registrado no app.ts.
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(`[UNEXPECTED ERROR] ${req.method} ${req.originalUrl}:`, err);

  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/** Cai aqui quando nenhuma rota bate com a requisição (404 de rota, não de recurso) */
export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Rota ${req.originalUrl} não existe` });
}
