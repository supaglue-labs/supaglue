import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { PostHog } from 'posthog-node';

const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const enable = Boolean(
  !(process.env.SUPAGLUE_DISABLE_ANALYTICS || process.env.CI) && process.env.SUPAGLUE_POSTHOG_API_KEY
);

export const client = new PostHog(process.env.SUPAGLUE_POSTHOG_API_KEY ?? 'dummy', {
  enable,
});

export function middleware(event: string) {
  return (req: Request, res: Response, next: any) => {
    if (!req.headers['x-distinct-id']) {
      return next();
    }

    client.capture({
      distinctId: req.headers['x-distinct-id'] as string,
      event,
      properties: {
        params: req.params,
        query: req.query,
        result: 'success',
        source: 'api',
        system: {
          version,
          arch: process.arch,
          os: process.platform,
          nodeVersion: process.version,
        },
      },
    });

    return next();
  };
}

export function errorMiddleware(event: string) {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (!req.headers['x-distinct-id']) {
      return next();
    }

    client.capture({
      distinctId: req.headers['x-distinct-id'] as string,
      event,
      properties: {
        params: req.params,
        query: req.query,
        error: err.message,
        result: 'error',
        source: 'api',
      },
    });

    return next(err);
  };
}
