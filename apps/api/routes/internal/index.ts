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
import syncConfig from './sync_config';
import syncRun from './sync_run';
import webhook from './webhook';

export default function init(app: Router): void {
  // application routes should not require application header
  const internalApplicationRouter = Router();
  internalApplicationRouter.use(internalMiddleware);
  internalApplicationRouter.use(orgHeaderMiddleware);

  application(internalApplicationRouter);
  auth(internalApplicationRouter);

  app.use('/internal', internalApplicationRouter);

  // non-application routes require application header
  const internalRouter = Router();
  internalRouter.use(internalMiddleware);
  internalRouter.use(orgHeaderMiddleware);
  internalRouter.use(internalApplicationMiddleware);

  apiKey(internalRouter);
  customer(internalRouter);
  destination(internalRouter);
  provider(internalRouter);
  schema(internalRouter);
  webhook(internalRouter);
  syncConfig(internalRouter);
  syncRun(internalRouter);

  app.use('/internal', internalRouter);
}
