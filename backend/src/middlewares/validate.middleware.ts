import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '@/utils/AppError';

/**
 * Recebe um schema Zod e valida req.body antes de chegar no controller.
 * Assim os controllers nunca precisam confiar "na fé" no formato do
 * payload — ou o dado é válido, ou a requisição nem entra na lógica.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw AppError.badRequest(message);
    }

    req.body = result.data;
    next();
  };
}
