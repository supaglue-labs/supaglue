import { addLogContext } from '@supaglue/core/lib/logger';
import type { NextFunction, Request, Response } from 'express';

export async function pinoContextMiddleware(req: Request, res: Response, next: NextFunction) {
  addLogContext('applicationEnv', req.supaglueApplication.environment);
  addLogContext('applicationName', req.supaglueApplication.name);
  addLogContext('applicationId', req.supaglueApplication.id);
  addLogContext('orgId', req.supaglueApplication.orgId);

  next();
}
