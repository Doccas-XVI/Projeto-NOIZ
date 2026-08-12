import { NextFunction, Request, Response } from 'express';

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Envolve controllers async e encaminha qualquer erro para o
 * middleware de erro central via next(err), em vez de deixar a
 * Promise rejeitada derrubar o processo.
 */
export const asyncHandler = (fn: AsyncController) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
