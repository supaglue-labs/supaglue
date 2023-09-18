import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import person from './person';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(openapiMiddleware('enrichment', 'v2'));

  person(v2Router);

  v2Router.use(openApiErrorHandlerMiddleware);

  app.use('/v2', v2Router);
}
