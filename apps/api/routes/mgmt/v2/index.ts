import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import customer from './customer';
import destination from './destination';
import entity from './entity';
import entityMapping from './entity_mapping';
import fieldMapping from './field_mapping';
import property from './property';
import provider from './provider';
import schema from './schema';
import sync from './sync';
import syncConfig from './sync_config';
import syncRun from './sync_run';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(apiKeyHeaderMiddleware);
  v2Router.use(openapiMiddleware('mgmt', 'v2'));

  customer(v2Router);
  destination(v2Router);
  provider(v2Router);
  schema(v2Router);
  syncConfig(v2Router);
  sync(v2Router);
  syncRun(v2Router);
  fieldMapping(v2Router);
  property(v2Router);
  entity(v2Router);
  entityMapping(v2Router);

  app.use('/v2', v2Router);
}
