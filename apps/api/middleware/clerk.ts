import { UnauthorizedError } from '@supaglue/core/errors';
import { addLogContext } from '@supaglue/core/lib/logger';
import type { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

export async function clerkMiddleware(req: Request, res: Response, next: NextFunction) {
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
  } else {
    next();
  }
}
