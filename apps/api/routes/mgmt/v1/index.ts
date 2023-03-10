import { openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import customer from './customer';
import integration from './integration';

export default function init(app: Router): void {
  const v1Router = Router();

  v1Router.use(openapiMiddleware('mgmt'));

  customer(v1Router);
  integration(v1Router);

  app.use('/v1', v1Router);
}
