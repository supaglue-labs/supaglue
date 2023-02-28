import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { PostHog } from 'posthog-node';
import { v4 as uuidv4 } from 'uuid';

const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const enable = Boolean(process.env.SUPAGLUE_DISABLE_ANALYTICS !== '1' && process.env.SUPAGLUE_POSTHOG_API_KEY);
const configPath = path.join(os.homedir(), '.supaglue', 'session.json');
let distinctIdentifier: string | undefined = undefined;

if (enable) {
  // read distinctId from config file or write it if it doesn't exist
  if (fs.existsSync(configPath)) {
    const session = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!session.distinctIdentifier) {
      session.distinctIdentifier = uuidv4();
      fs.writeFileSync(configPath, JSON.stringify(session), 'utf8');
    }

    ({ distinctIdentifier } = session);
  } else {
    distinctIdentifier = uuidv4();
    fs.mkdirSync(path.join(os.homedir(), '.supaglue'), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({ distinctIdentifier }));
  }
}

export const distinctId = distinctIdentifier && `session:${distinctIdentifier}`;

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

export function middleware(req: Request, res: Response, next: NextFunction) {
  if (!distinctId) {
    return next();
  }

  client.capture({
    distinctId,
    event: 'API Call',
    properties: {
      params: req.params,
      providerName: getProviderNameFromRequest(req),
      query: req.query,
      result: 'success',
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

  return next();
}

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (!distinctId) {
    return next(err);
  }

  client.capture({
    distinctId,
    event: 'API Call',
    properties: {
      params: req.params,
      providerName: getProviderNameFromRequest(req),
      query: req.query,
      error: err.message,
      path: req.originalUrl,
      result: 'error',
      source: 'api',
    },
  });

  return next(err);
}
