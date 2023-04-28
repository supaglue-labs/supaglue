import { UnauthorizedError } from '@supaglue/core/errors';
import { addLogContext } from '@supaglue/core/lib/logger';
import { NextFunction, Request, Response } from 'express';

export async function orgHeaderMiddleware(req: Request, res: Response, next: NextFunction) {
  const orgId = req.headers['x-org-id'] as string;

  if (!orgId) {
    throw new UnauthorizedError(`x-org-id header must be set`);
  }

  req.orgId = orgId;

  addLogContext('orgId', orgId);

  next();
}
