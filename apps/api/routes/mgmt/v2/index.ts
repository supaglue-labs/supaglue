import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import customer from './customer';
import destination from './destination';
import provider from './provider';
import schema from './schema';
import syncConfig from './sync_config';
import syncRun from './sync_run';
import webhook from './webhook';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(apiKeyHeaderMiddleware);
  v2Router.use(openapiMiddleware('mgmt', 'v2'));

  customer(v2Router);
  destination(v2Router);
  provider(v2Router);
  schema(v2Router);
  webhook(v2Router);
  syncConfig(v2Router);
  syncRun(v2Router);

  app.use('/v2', v2Router);
}
