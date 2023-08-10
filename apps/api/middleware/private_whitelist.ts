import { UnauthorizedError } from '@supaglue/core/errors';
import type { NextFunction, Request, Response } from 'express';

const applicationIdWhitelist = ['cb957d66-0ca0-4a4b-b2c0-2a5bfc36e936'];

export async function privateApiWhitelistMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!applicationIdWhitelist.includes(req.supaglueApplication.id)) {
    throw new UnauthorizedError('application id must be whitelisted');
  }

  next();
}
