import { configureScope } from '@sentry/node';
import { addLogContext } from '@supaglue/core/lib/logger';
import type { NextFunction, Request, Response } from 'express';

export async function pinoAndSentryContextMiddleware(req: Request, res: Response, next: NextFunction) {
  addLogContext('applicationEnv', req.supaglueApplication.environment);
  addLogContext('applicationName', req.supaglueApplication.name);

  addLogContext('applicationId', req.supaglueApplication.id);
  configureScope((scope) => scope.setTag('applicationId', req.supaglueApplication.id));

  addLogContext('orgId', req.supaglueApplication.orgId);
  configureScope((scope) => scope.setUser({ id: req.supaglueApplication.orgId, ip_address: req.ip }));

  next();
}
