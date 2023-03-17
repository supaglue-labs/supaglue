import { BadRequestError, UnauthorizedError } from '@supaglue/core/errors';
import { NextFunction, Request, Response } from 'express';
import { getDependencyContainer } from '../dependency_container';

const { applicationService } = getDependencyContainer();

const sgInternalToken = process.env.SUPAGLUE_INTERNAL_TOKEN;

export async function internalMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-sg-internal-token'] as string;
  const applicationId = req.headers['x-application-id'] as string;

  if (!token) {
    throw new UnauthorizedError(`x-sg-internal-token header must be set`);
  }

  if (token !== sgInternalToken) {
    throw new UnauthorizedError(`x-sg-internal-token header is not valid`);
  }

  if (!applicationId) {
    throw new BadRequestError('x-application-id must be set');
  }

  req.supaglueApplication = await applicationService.getById(applicationId);

  next();
}
