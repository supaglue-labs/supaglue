import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { openapiMiddleware } from '@/middleware/openapi';
import { pinoAndSentryContextMiddleware } from '@/middleware/pino_context';
import { Router } from 'express';
import connectionSyncConfig from './connection_sync_config';
import customer from './customer';
import destination from './destination';
import entity from './entity';
import entityMapping from './entity_mapping';
import fieldMapping from './field_mapping';
import magicLink from './magic_link';
import provider from './provider';
import schema from './schema';
import sync from './sync';
import syncConfig from './sync_config';
import syncRun from './sync_run';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(apiKeyHeaderMiddleware);
  v2Router.use(openapiMiddleware('mgmt', 'v2'));
  v2Router.use(pinoAndSentryContextMiddleware);

  customer(v2Router);
  destination(v2Router);
  provider(v2Router);
  schema(v2Router);
  syncConfig(v2Router);
  sync(v2Router);
  syncRun(v2Router);
  fieldMapping(v2Router);
  connectionSyncConfig(v2Router);
  entity(v2Router);
  entityMapping(v2Router);
  magicLink(v2Router);

  app.use('/v2', v2Router);
}
