import { Express } from 'express';

import cliConfig from './cli_config';
import developerConfig from './developer_config';
import field from './field';
import integration from './integration';
import oauth from './oauth';
import sync from './sync';

// TODO: ENG-105 version and guard routes
export default function initRoutes(app: Express): void {
  app.use('/developer_config', developerConfig);
  app.use('/integrations', integration);
  app.use('/oauth', oauth);
  app.use('/syncs', sync);
  app.use('/fields', field);
  app.use('/cli_config', cliConfig);
}
