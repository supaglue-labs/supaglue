import { UnauthorizedError } from '@supaglue/core/errors';
import type { NextFunction, Request, Response } from 'express';

const applicationIdWhitelist = [
  'cb957d66-0ca0-4a4b-b2c0-2a5bfc36e936' /* prod */,
  'ebf0f803-55bc-48b2-8a98-5f0fffae5a1c' /* dev */,
];

export async function privateApiWhitelistMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!applicationIdWhitelist.includes(req.supaglueApplication.id)) {
    throw new UnauthorizedError('application id must be whitelisted');
  }

  next();
}
