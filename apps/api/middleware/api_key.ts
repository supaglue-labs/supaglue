import { UnauthorizedError } from '@supaglue/core/errors';
import { NextFunction, Request, Response } from 'express';
import { getDependencyContainer } from '../dependency_container';

const { applicationService } = getDependencyContainer();

export async function apiKeyHeaderMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    throw new UnauthorizedError(`x-api-key header must be set`);
  }

  req.supaglueApplication = await applicationService.getByApiKey(apiKey);

  next();
}
