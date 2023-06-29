import { getDependencyContainer } from '@/dependency_container';
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
import syncInfo from './sync_info';
import syncRun from './sync_run';
import webhook from './webhook';

const { connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router): void {
  // application routes should not require application header
  const internalApplicationRouter = Router();
  internalApplicationRouter.use(internalMiddleware);

  // TODO: Remove this when we have fully moved over to ObjectSyncs
  internalApplicationRouter.post('/_move_to_object_syncs', async (req, res) => {
    await connectionAndSyncService.moveToObjectSyncs();
    res.status(200).send();
  });

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
  syncInfo(internalRouter);
  syncRun(internalRouter);

  app.use('/internal', internalRouter);
}
