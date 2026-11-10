import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { AppError } from '@/utils/AppError';
import { env } from '@/config/env';

/**
 * Converte erros "conhecidos" de bibliotecas em AppError, para que o
 * cliente receba um status HTTP correto em vez de um 500 genérico.
 */
function normalizeError(err: Error): Error {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // violação de unique (ex: música já está na playlist)
        return AppError.conflict('Este registro já existe');
      case 'P2025': // registro não encontrado em update/delete
        return AppError.notFound();
      case 'P2003': // violação de chave estrangeira (ex: trackId inexistente)
        return AppError.badRequest('Referência inválida: o item relacionado não existe');
    }
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new AppError(
        'Arquivo grande demais. Limite: 20MB para áudio e 5MB para imagens.',
        413,
      );
    }
    return AppError.badRequest(`Erro no upload: ${err.message}`);
  }

  return err;
}

/**
 * Único ponto da aplicação que decide o formato da resposta de erro.
 * - AppError (erro de negócio previsto) -> statusCode e mensagem originais.
 * - Qualquer outro erro (bug, exceção do driver do banco etc) -> 500
 *   genérico, e só expomos o stack trace em desenvolvimento.
 *
 * Precisa ser o ÚLTIMO middleware registrado no app.ts.
 */
export function errorMiddleware(rawError: Error, req: Request, res: Response, _next: NextFunction) {
  const err = normalizeError(rawError);

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
