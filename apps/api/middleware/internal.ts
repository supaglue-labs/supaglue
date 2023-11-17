import { UnauthorizedError } from '@supaglue/core/errors';
import type { NextFunction, Request, Response } from 'express';

const sgInternalToken = process.env.SUPAGLUE_INTERNAL_TOKEN;

export async function internalMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-sg-internal-token'] as string;

  if (!token) {
    throw new UnauthorizedError(`x-sg-internal-token header must be set`);
  }

  if (token !== sgInternalToken) {
    throw new UnauthorizedError(`x-sg-internal-token header is not valid`);
  }

  next();
}
