import { internalMiddleware } from '@/middleware/internal';
import { internalApplicationMiddleware } from '@/middleware/internal_application';
import { orgHeaderMiddleware } from '@/middleware/org';
import { Router } from 'express';
import apiKey from './api_key';
import application from './application';
import auth from './auth';
import customer from './customer';
import destination from './destination';
import integration from './integration';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import webhook from './webhook';

export default function init(app: Router): void {
  // application routes should not require application header
  const v2ApplicationRouter = Router();
  v2ApplicationRouter.use(internalMiddleware);

  v2ApplicationRouter.use(orgHeaderMiddleware);

  application(v2ApplicationRouter);
  auth(v2ApplicationRouter);

  app.use('/v2', v2ApplicationRouter);

  // non-application routes require application header
  const v2Router = Router();
  v2Router.use(internalMiddleware);
  v2Router.use(orgHeaderMiddleware);
  v2Router.use(internalApplicationMiddleware);

  apiKey(v2Router);
  customer(v2Router);
  destination(v2Router);
  integration(v2Router);
  webhook(v2Router);
  syncInfo(v2Router);
  syncHistory(v2Router);

  app.use('/v2', v2Router);
}
