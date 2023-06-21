import { openApiErrorHandlerMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import passthrough from './passthrough';

export default function init(app: Router): void {
  const v1Router = Router();

  passthrough(v1Router);

  v1Router.use(openApiErrorHandlerMiddleware);

  app.use('/v1', v1Router);
}
