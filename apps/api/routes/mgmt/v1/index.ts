import { getDependencyContainer } from '@/dependency_container';
import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { openapiMiddleware } from '@/middleware/openapi';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Router } from 'express';
import customer from './customer';
import integration from './integration';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import webhook from './webhook';

const { connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router): void {
  const v1Router = Router();

  v1Router.use(apiKeyHeaderMiddleware);
  v1Router.post('/_manually_fix_temporal_syncs', async (req, res) => {
    const result = await connectionAndSyncService.manuallyFixTemporalSyncs();
    return res.status(200).send(snakecaseKeys(result));
  });

  v1Router.use(openapiMiddleware('mgmt'));

  customer(v1Router);
  integration(v1Router);
  webhook(v1Router);
  syncInfo(v1Router);
  syncHistory(v1Router);

  app.use('/v1', v1Router);
}
