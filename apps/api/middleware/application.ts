import { BadRequestError } from '@supaglue/core/errors';
import { NextFunction, Request, Response } from 'express';
import { getDependencyContainer } from '../dependency_container';

const { applicationService } = getDependencyContainer();

export async function applicationMiddleware(req: Request, res: Response, next: NextFunction) {
  const applicationId = req.headers['x-application-id'] as string;

  if (!applicationId) {
    throw new BadRequestError('x-application-id must be set');
  }

  req.supaglueApplication = await applicationService.getById(applicationId);

  next();
}
