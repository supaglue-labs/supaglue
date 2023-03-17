import { NextFunction, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import path from 'path';

export const openapiMiddleware = (specDir: string) => {
  let apiSpec = path.join(process.cwd(), `openapi/${specDir}/openapi.bundle.json`);

  if (process.env.NODE_ENV === 'development') {
    apiSpec = path.join(process.cwd(), `../../openapi/${specDir}/openapi.bundle.json`);
  }

  return OpenApiValidator.middleware({
    apiSpec,
    // TODO: switch to true when we support X-Account-Token
    validateSecurity: false,
    validateRequests: {
      removeAdditional: 'all',
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
