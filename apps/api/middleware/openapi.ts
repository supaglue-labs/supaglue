import { NextFunction, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import fs from 'fs';
import path from 'path';

export const openapiMiddleware = (specDir: string) => {
  let apiSpec = path.join(process.cwd(), `openapi/${specDir}/openapi.bundle.json`);

  if (process.env.NODE_ENV === 'development') {
    apiSpec = path.join(process.cwd(), `../../openapi/${specDir}/openapi.bundle.json`);
  }

  const jsonApiSpec = JSON.parse(fs.readFileSync(apiSpec, 'utf8'));

  // hacks so validator doesn't complain
  // TODO remove this after validator support openapi 3.1.0

  jsonApiSpec.openapi = '3.0.3';
  delete jsonApiSpec.webhooks;

  return OpenApiValidator.middleware({
    apiSpec: jsonApiSpec,
    // TODO: switch to true when we support X-Account-Token
    validateSecurity: false,
    validateRequests: {
      removeAdditional: true,
    },
  });
};

export const openApiErrorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if ('status' in err && 'message' in err && 'errors' in err) {
    let { errors } = err;
    if (!errors) {
      errors = [err];
    }
    return res.status(err.status || 400).json({
      errors: errors.map((e: any) => ({
        title: err.message,
        detail: err.message,
        source: {
          pointer: e.path,
        },
        problem_type: 'VALIDATION_ERROR',
      })),
    });
  }

  return next(err);
};
