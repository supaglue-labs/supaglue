import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import customer from './customer';
import integration from './integration';
import webhook from './webhook';

export default function init(app: Router): void {
  const v1Router = Router();

  v1Router.use(openapiMiddleware('mgmt'));
  v1Router.use(apiKeyHeaderMiddleware);

  customer(v1Router);
  integration(v1Router);
  webhook(v1Router);

  app.use('/v1', v1Router);
}
