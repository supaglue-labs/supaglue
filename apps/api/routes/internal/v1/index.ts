import { applicationMiddleware } from '@/middleware/application';
import { internalMiddleware } from '@/middleware/internal';
import { Router } from 'express';
import apiKey from './api_key';
import application from './application';
import auth from './auth';
import customer from './customer';
import integration from './integration';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import webhook from './webhook';

export default function init(app: Router): void {
  // application routes should not require application header
  const v1ApplicationRouter = Router();
  v1ApplicationRouter.use(internalMiddleware);

  application(v1ApplicationRouter);
  auth(v1ApplicationRouter);

  app.use('/v1', v1ApplicationRouter);

  // non-application routes require application header
  const v1Router = Router();
  v1Router.use(internalMiddleware);
  v1Router.use(applicationMiddleware);

  apiKey(v1Router);
  customer(v1Router);
  integration(v1Router);
  webhook(v1Router);
  syncInfo(v1Router);
  syncHistory(v1Router);

  app.use('/v1', v1Router);
}
