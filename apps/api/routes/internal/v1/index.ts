import { internalMiddleware } from '@/middleware/internal';
import { Router } from 'express';
import api_key from './api_key';
import customer from './customer';
import integration from './integration';
import webhook from './webhook';

export default function init(app: Router): void {
  const v1Router = Router();

  v1Router.use(internalMiddleware);

  api_key(v1Router);
  customer(v1Router);
  integration(v1Router);
  webhook(v1Router);

  app.use('/v1', v1Router);
}
