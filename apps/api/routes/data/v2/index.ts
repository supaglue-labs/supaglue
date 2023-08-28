import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import salesforce from './salesforce';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(openapiMiddleware('data', 'v2'));

  salesforce(v2Router);

  v2Router.use(openApiErrorHandlerMiddleware);

  app.use('/v2', v2Router);
}
