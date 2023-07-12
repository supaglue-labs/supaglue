import { internalMiddleware } from '@/middleware/internal';
import { internalApplicationMiddleware } from '@/middleware/internal_application';
import { orgHeaderMiddleware } from '@/middleware/org';
import { Router } from 'express';
import apiKey from './api_key';
import application from './application';
import auth from './auth';
import customer from './customer';
import destination from './destination';
import provider from './provider';
import schema from './schema';
import sync from './sync';
import syncConfig from './sync_config';
import syncRun from './sync_run';
import system from './system';
import webhook from './webhook';

export default function init(app: Router): void {
  // internal routes should require only internal middleware
  const internalRouter = Router();
  internalRouter.use(internalMiddleware);

  system(internalRouter);

  app.use('/internal', internalRouter);

  // org-scoped routes should not require application header
  const internalOrgScopedRouter = Router();
  internalOrgScopedRouter.use(internalMiddleware);
  internalOrgScopedRouter.use(orgHeaderMiddleware);

  application(internalOrgScopedRouter);
  auth(internalOrgScopedRouter);

  app.use('/internal', internalOrgScopedRouter);

  // application-scoped routes require application header
  const internalApplicationScopedRouter = Router();
  internalApplicationScopedRouter.use(internalMiddleware);
  internalApplicationScopedRouter.use(orgHeaderMiddleware);
  internalApplicationScopedRouter.use(internalApplicationMiddleware);

  apiKey(internalApplicationScopedRouter);
  customer(internalApplicationScopedRouter);
  destination(internalApplicationScopedRouter);
  provider(internalApplicationScopedRouter);
  schema(internalApplicationScopedRouter);
  webhook(internalApplicationScopedRouter);
  sync(internalApplicationScopedRouter);
  syncConfig(internalApplicationScopedRouter);
  syncRun(internalApplicationScopedRouter);

  app.use('/internal', internalApplicationScopedRouter);
}
