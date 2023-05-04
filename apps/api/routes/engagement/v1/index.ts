import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import passthrough from './passthrough';

export default function init(app: Router): void {
  const v1Router = Router();

  v1Router.use(openapiMiddleware('crm'));

  passthrough(v1Router);

  v1Router.use(openApiErrorHandlerMiddleware);

  app.use('/v1', v1Router);
}
