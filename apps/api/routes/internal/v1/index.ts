import { internalMiddleware } from '@/middleware/internal';
import { Router } from 'express';
import apiKey from './api_key';
import auth from './auth';
import customer from './customer';
import integration from './integration';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import webhook from './webhook';

export default function init(app: Router): void {
  const v1Router = Router();
  v1Router.use(internalMiddleware);

  auth(v1Router);
  apiKey(v1Router);
  customer(v1Router);
  integration(v1Router);
  webhook(v1Router);
  syncInfo(v1Router);
  syncHistory(v1Router);

  app.use('/v1', v1Router);
}
