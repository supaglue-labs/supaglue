import { openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import application from './application';

export default function init(app: Router): void {
  const v1Router = Router();

  v1Router.use(openapiMiddleware('mgmt'));

  application(v1Router);

  app.use('/v1', v1Router);
}
