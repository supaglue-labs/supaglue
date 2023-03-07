import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { PostHog } from 'posthog-node';

import { distinctId } from './distinct_identifier';

const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const enable = Boolean(process.env.SUPAGLUE_DISABLE_ANALYTICS !== '1' && process.env.SUPAGLUE_POSTHOG_API_KEY);

export const client = new PostHog(process.env.SUPAGLUE_POSTHOG_API_KEY ?? 'dummy', {
  enable,
});

function getProviderNameFromRequest(req: Request) {
  let { providerName } = req.query;
  if (!providerName && 'state' in req.query && typeof req.query.state === 'string') {
    ({ providerName } = JSON.parse(req.query.state));
  }

  return providerName;
}

function onResFinished(req: Request, res: Response, err?: any) {
  if (!distinctId || res.locals.analyticsLogged) {
    return;
  }

  const error = err ?? res.locals.error;

  client.capture({
    distinctId,
    event: 'API Call',
    properties: {
      method: req.method,
      route: `${req.baseUrl}${req.route?.path ?? ''}`,
      params: req.params,
      providerName: getProviderNameFromRequest(req),
      query: req.query,
      result: error ? 'error' : 'success',
      error: error?.message,
      source: 'api',
      path: req.originalUrl,
      system: {
        version,
        arch: process.arch,
        os: process.platform,
        nodeVersion: process.version,
      },
    },
  });
  res.locals.analyticsLogged = true;
}

export function posthogMiddleware(req: Request, res: Response, next: NextFunction) {
  const onResponseComplete = (err: any) => {
    res.removeListener('close', onResponseComplete);
    res.removeListener('finish', onResponseComplete);
    res.removeListener('error', onResponseComplete);

    return onResFinished(req, res, err);
  };

  res.on('close', onResponseComplete);
  res.on('finish', onResponseComplete);
  res.on('error', onResponseComplete);

  return next();
}

export function posthogErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  res.locals.error = err;
  return next(err);
}
