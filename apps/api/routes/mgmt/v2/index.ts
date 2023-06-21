import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import customer from './customer';
import destination from './destination';
import forceSync from './force_sync';
import provider from './provider';
import syncConfig from './sync_config';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import syncMigration from './sync_migration';
import webhook from './webhook';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(apiKeyHeaderMiddleware);
  v2Router.use(openapiMiddleware('mgmt', 'v2'));

  customer(v2Router);
  destination(v2Router);
  provider(v2Router);
  webhook(v2Router);
  syncConfig(v2Router);
  syncInfo(v2Router);
  syncHistory(v2Router);
  forceSync(v2Router);

  // TODO: Remove when we're done with migrating connections
  syncMigration(v2Router);

  app.use('/v2', v2Router);
}
