import { UnauthorizedError } from '@supaglue/core/errors';
import { addLogContext } from '@supaglue/core/lib/logger';
import type { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const sgInternalToken = process.env.SUPAGLUE_INTERNAL_TOKEN;

export async function internalMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.IS_CLOUD && process.env.CLERK_JWKS_URL) {
    const bearerToken = req.headers.authorization?.replace('Bearer ', '');
    if (!bearerToken) {
      throw new UnauthorizedError(`Authorization header must be set`);
    }

    const client = jwksClient({
      jwksUri: process.env.CLERK_JWKS_URL,
    });

    verify(
      bearerToken,
      async (header, callback) => {
        const key = await client.getSigningKey(header.kid);
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      },
      (err, decoded) => {
        addLogContext('userId', (decoded as any)?.sub);
        addLogContext('actorId', (decoded as any)?.actor?.sub);
        next(err);
      }
    );
    return;
  }

  const token = req.headers['x-sg-internal-token'] as string;

  if (!token) {
    throw new UnauthorizedError(`x-sg-internal-token header must be set`);
  }

  if (token !== sgInternalToken) {
    throw new UnauthorizedError(`x-sg-internal-token header is not valid`);
  }

  next();
}
