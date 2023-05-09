import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import contact from './contact';
import passthrough from './passthrough';
import user from './user';

export default function init(app: Router): void {
  const v1Router = Router();

  v1Router.use(openapiMiddleware('engagement'));

  contact(v1Router);
  user(v1Router);
  passthrough(v1Router);

  v1Router.use(openApiErrorHandlerMiddleware);

  app.use('/v1', v1Router);
}
